import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

// Rate limiting map: IP -> { count, resetTime }
const rateLimitMap = new Map<
  string,
  { count: number; resetTime: number }
>();

const MAX_REQUESTS_PER_WINDOW = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  record.count++;
  return true;
}

// System prompt with Brian's profile and projects
const SYSTEM_PROMPT = `You are Brian Hsu's portfolio assistant. You help visitors learn about Brian's work, experience, and projects.

## About Brian
Brian Hsu is a Computer Science and Cognitive Science student at the University of Michigan with a 3.9 GPA. He builds high-performance systems — from HPC clusters and scientific computing platforms to data pipelines and ML research tooling — with an eye for how software supports real human and scientific workflows.

## Focus Areas
- HPC & Supercomputing
- Distributed Systems
- Scientific Computing
- Systems Programming
- Machine Learning
- Cognitive Science

## Experience

### Supercomputing Engineer at Los Alamos National Laboratory (May 2026 – Aug 2026)
Building HPC clusters from scratch with Rocky Linux, iPXE, and SLURM — InfiniBand/Ethernet networking and benchmarking 400Gb/s+ data transfers.

### Scientific Computing Engineer at Memorial Sloan Kettering Cancer Center (Jun 2025 – Sep 2025)
Shipped an Open OnDemand dashboard for MSK's HPC cluster, cutting new-user support tickets by 20%. Built real-time SLURM monitoring and automated usage reporting.

### Data Analytics Intern at Lyft (Jun 2024 – Aug 2024)
Built SQL pipelines analyzing 44k+ users; proposed scoring changes that reduced operational costs by 7% and negative user costs by 12%.

## Featured Projects

### HPC Cluster Build
Built and validated a multi-node HPC cluster from scratch at a national laboratory. Covered bare-metal node provisioning with iPXE and a custom boot server, SLURM workload management, InfiniBand fabric bring-up, and verification that both IB and Ethernet paths were performing at expected bandwidth. The most important lesson: 'it works' and 'it works correctly at the expected performance level' are different claims.
Tech: Rocky Linux, iPXE, SLURM, InfiniBand/RDMA, Ansible, Python, Bash, Prometheus, Grafana

### Distributed Cache Layer
A Redis-inspired distributed cache with consistent hashing, TTL eviction, and a lightweight gRPC API. Handles 50k+ ops/sec in local benchmarks with sub-millisecond p99 reads. Shard rebalancing on node add/remove completes in under 200ms for a 4-node cluster.
Tech: Go, gRPC, Consistent Hashing, Docker, Prometheus

### ETA Prediction Pipeline (Lyft)
Contributed to feature engineering and evaluation infrastructure for ride ETA models. One feature reduced MAE by ~4% on highway-to-surface-street transitions in the Bay Area market. Production ML is 20% modeling and 80% data plumbing, monitoring, and stakeholder alignment.
Tech: Python, Spark, Airflow, Feature Stores, A/B Testing

### Cognitive Load Tracker
A research tool that correlates task-switching behavior with self-reported cognitive load, combining browser telemetry with validated psychometric scales. Pilot study with 12 participants showed a significant correlation (r ≈ 0.72) between switch frequency and reported mental demand during coding tasks.
Tech: TypeScript, React, Python, Flask, D3.js, SQLite

### Work-Stealing Thread Pool
A lock-free work-stealing scheduler with futures support, built for EECS 482 to deeply understand parallelism primitives. Near-linear speedup on CPU-bound benchmarks up to core count. False sharing and memory ordering bugs are subtle.
Tech: C++17, std::thread, Atomics, CMake, Google Test

## Skills
Python, C/C++, Linux, AWS, Docker, SLURM, React, PyTorch

## Instructions
- Be concise and technical. Brian's audience includes engineers and researchers.
- When asked about specific projects, provide detailed technical information.
- If asked about skills or experience, reference specific projects and accomplishments.
- You can suggest opening specific projects or apps if relevant to the conversation.
- If you don't know something, say so honestly.
- Keep responses focused and avoid unnecessary elaboration unless asked.`;

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request: messages array required" },
        { status: 400 }
      );
    }

    // Try OpenAI first
    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const assistantMessage = completion.choices[0]?.message?.content;

      if (!assistantMessage) {
        throw new Error("No response from OpenAI");
      }

      return NextResponse.json({
        message: assistantMessage,
        provider: "openai",
      });
    } catch (openaiError) {
      console.error("OpenAI failed, falling back to Claude:", openaiError);

      // Fallback to Claude
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      // Filter and format messages for Claude (must alternate user/assistant)
      const claudeMessages = messages
        .filter((msg: any) => msg.role !== "system")
        .map((msg: any) => ({
          role: msg.role === "assistant" ? ("assistant" as const) : ("user" as const),
          content: msg.content,
        }));

      const claudeCompletion = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: claudeMessages,
      }) as Anthropic.Messages.Message;

      const claudeMessage = claudeCompletion.content[0];
      const assistantMessage =
        claudeMessage.type === "text" ? claudeMessage.text : "";

      if (!assistantMessage) {
        throw new Error("No response from Claude");
      }

      return NextResponse.json({
        message: assistantMessage,
        provider: "claude",
      });
    }
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to generate response. Please check your API configuration.",
      },
      { status: 500 }
    );
  }
}
