"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { FileDown } from "lucide-react";
import { useWindowStore } from "@/store/windowStore";
import type { LanyardMotion } from "@/components/effects/Lanyard";

// 3D card pulls in WebGL + a WASM physics engine — client-only, and lazy so it
// never blocks the rest of the About window from rendering.
const Lanyard = dynamic(() => import("@/components/effects/Lanyard"), {
  ssr: false,
});

interface AboutAppProps {
  windowId?: string;
}

const experiences = [
  {
    role: "Supercomputing Engineer",
    org: "Los Alamos National Laboratory",
    period: "May 2026 – Aug 2026",
    detail:
      "Building HPC clusters from scratch with Rocky Linux, iPXE, and SLURM — InfiniBand/Ethernet networking, automated node provisioning, and benchmarking 400Gb/s+ data transfers for large-scale workloads.",
  },
  {
    role: "Scientific Computing Engineer",
    org: "Memorial Sloan Kettering Cancer Center",
    period: "Jun 2025 – Sep 2025",
    detail:
      "Shipped an Open OnDemand dashboard (Ruby on Rails) for MSK's HPC cluster, cutting new-user support tickets by 20%. Built real-time SLURM monitoring with Pandas + Chart.js and automated usage reporting with Python, Bash, and Ansible.",
  },
  {
    role: "Data Analytics Intern",
    org: "Lyft",
    period: "Jun 2024 – Aug 2024",
    detail:
      "Built SQL pipelines analyzing 44k+ users and Bike Angels ride data to detect fraud and station-flipping abuse. Proposed scoring changes that reduced operational costs by 7% and negative user costs by 12%.",
  },
];

const focusAreas = [
  { label: "HPC & Supercomputing", emoji: "🖥️" },
  { label: "Distributed Systems", emoji: "🔗" },
  { label: "Scientific Computing", emoji: "🔬" },
  { label: "Systems Programming", emoji: "⚡" },
  { label: "Machine Learning", emoji: "🧠" },
  { label: "Cognitive Science", emoji: "👁️" },
];

const skills = [
  "Python",
  "C/C++",
  "Linux",
  "AWS",
  "Docker",
  "SLURM",
  "React",
  "PyTorch",
];

export function AboutApp({ windowId }: AboutAppProps) {
  // Accumulates the host window's screen-space velocity; the Lanyard's physics
  // loop reads and decays it so dragging the window makes the card swing.
  const motionRef = useRef<LanyardMotion>({ x: 0, y: 0 });

  useEffect(() => {
    if (!windowId) return;
    let prevX: number | null = null;
    let prevY: number | null = null;

    const readPosition = (win: { x: number; y: number } | undefined) => {
      if (!win) return;
      if (prevX !== null && prevY !== null) {
        motionRef.current.x += win.x - prevX;
        motionRef.current.y += win.y - prevY;
      }
      prevX = win.x;
      prevY = win.y;
    };

    readPosition(
      useWindowStore.getState().windows.find((w) => w.id === windowId)
    );
    const unsubscribe = useWindowStore.subscribe((state) => {
      readPosition(state.windows.find((w) => w.id === windowId));
    });
    return unsubscribe;
  }, [windowId]);

  return (
    <div className="app-content h-full overflow-y-auto">
      <section className="lanyard-hero">
        <div className="lanyard-canvas">
          <Lanyard
            position={[0, 0, 18]}
            gravity={[0, -40, 0]}
            frontImage="/lanyard/brian-card.png"
            imageFit="cover"
            motionRef={motionRef}
          />
        </div>
        <div className="lanyard-hero-hint" aria-hidden>
          <span className="lanyard-hero-hint-text">About</span>
          <span className="lanyard-hero-hint-chevron">⌄</span>
        </div>
      </section>

      <motion.div
        className="p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-lg font-semibold">About Me</h2>
        <p className="mt-2 text-sm leading-relaxed text-foreground/60">
          I&apos;m a Computer Science and Cognitive Science student at the
          University of Michigan, with a focus on computation and human behavior. I build
          high-performance systems — from HPC clusters and scientific computing
          platforms to data pipelines and ML research tooling — with an eye for
          how software supports real human and scientific workflows.
        </p>

        <h3 className="mt-6 text-sm font-semibold text-foreground/80">
          Focus Areas
        </h3>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
          {focusAreas.map((item) => (
            <span
              key={item.label}
              className="inline-flex items-center gap-1.5 text-xs text-foreground/60"
            >
              <span>{item.emoji}</span>
              {item.label}
            </span>
          ))}
        </div>

        <h3 className="mt-6 text-sm font-semibold text-foreground/80">
          Experience
        </h3>
        <div className="mt-3 divide-y divide-foreground/8">
          {experiences.map((exp) => (
            <div key={`${exp.org}-${exp.period}`} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{exp.role}</p>
                  <p className="text-xs text-foreground/50">{exp.org}</p>
                </div>
                <span className="shrink-0 text-xs text-foreground/40">
                  {exp.period}
                </span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-foreground/55">
                {exp.detail}
              </p>
            </div>
          ))}
        </div>

        <h3 className="mt-6 text-sm font-semibold text-foreground/80">
          Education
        </h3>
        <p className="mt-2 text-sm text-foreground/60">
          B.S. Computer Science &amp; B.S. Cognitive Science
          <br />
          <span className="text-foreground/50">Computation track · GPA 3.9/4.0</span>
          <br />
          <span className="text-foreground/40">
            University of Michigan, Ann Arbor
          </span>
        </p>

        <h3 className="mt-6 text-sm font-semibold text-foreground/80">
          Skills
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-foreground/55">
          {skills.join(" · ")}
        </p>

        <a
          href="/Resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 text-xs font-medium text-foreground/55 transition-colors hover:text-sky-400"
        >
          <FileDown size={14} />
          View Resume
        </a>
      </motion.div>
    </div>
  );
}
