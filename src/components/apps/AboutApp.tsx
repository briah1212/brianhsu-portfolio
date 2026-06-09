"use client";

import { motion } from "framer-motion";

const experiences = [
  {
    role: "Software Engineering Intern",
    org: "Lyft",
    period: "Summer 2025",
    detail: "Maps & routing — ETA prediction, feature engineering, production ML pipelines.",
  },
  {
    role: "Research Assistant",
    org: "Cognitive Science Lab",
    period: "2024 – Present",
    detail: "HCI instrumentation, cognitive load measurement, behavioral data analysis.",
  },
  {
    role: "Course Staff",
    org: "EECS 281 / EECS 482",
    period: "2024 – Present",
    detail: "Algorithms and operating systems — projects, grading, office hours.",
  },
];

const interests = [
  { label: "Distributed Systems", emoji: "🔗" },
  { label: "Machine Learning", emoji: "🧠" },
  { label: "Human-Computer Interaction", emoji: "👁️" },
  { label: "Concurrent Programming", emoji: "⚡" },
  { label: "Cognitive Modeling", emoji: "🔬" },
  { label: "Developer Tools", emoji: "🛠️" },
];

export function AboutApp() {
  return (
    <div className="app-content h-full overflow-y-auto p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-lg font-semibold">About Me</h2>
        <p className="mt-2 text-sm leading-relaxed text-foreground/60">
          I&apos;m a student at the University of Michigan studying Computer
          Science and Cognitive Science. I&apos;m drawn to problems that sit at
          the boundary of rigorous engineering and how people actually think and
          behave — building systems that are fast, correct, and humane.
        </p>

        <h3 className="mt-6 text-sm font-semibold text-foreground/80">
          Interests
        </h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {interests.map((item) => (
            <span
              key={item.label}
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground/5 px-3 py-1 text-xs text-foreground/70"
            >
              <span>{item.emoji}</span>
              {item.label}
            </span>
          ))}
        </div>

        <h3 className="mt-6 text-sm font-semibold text-foreground/80">
          Experience
        </h3>
        <div className="mt-3 space-y-3">
          {experiences.map((exp) => (
            <div
              key={exp.org}
              className="rounded-lg border border-foreground/5 bg-foreground/[0.02] p-3"
            >
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
          B.S.E. Computer Science &amp; B.A. Cognitive Science
          <br />
          <span className="text-foreground/40">
            University of Michigan, Ann Arbor
          </span>
        </p>
      </motion.div>
    </div>
  );
}
