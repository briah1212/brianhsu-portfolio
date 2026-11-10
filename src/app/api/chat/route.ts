import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt, sanitizeTurns } from "@/lib/chatPrompt";

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

const SYSTEM_PROMPT = buildSystemPrompt();

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    // x-forwarded-for can be a comma-separated proxy chain; the client is first.
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    const messages = sanitizeTurns(body?.messages);

    if (!messages) {
      return NextResponse.json(
        { error: "Invalid request: send a conversation ending with a user message" },
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

      // Thinking is always on for this model, so leave room for it and read
      // the first text block rather than assuming it comes first.
      const claudeCompletion = await anthropic.messages.create({
        model: "claude-opus-5-5",
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        messages,
      });

      const textBlock = claudeCompletion.content.find(
        (block) => block.type === "text"
      );
      const assistantMessage = textBlock?.type === "text" ? textBlock.text : "";

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
