"use client";

import { motion, useReducedMotion } from "framer-motion";
import { FileDown } from "lucide-react";

const SECTION_EASE = [0.22, 1, 0.36, 1] as const;

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

const education = {
  degree: "B.S. Computer Science & B.S. Cognitive Science",
  detail: "Computation track · GPA 3.9/4.0",
  school: "University of Michigan, Ann Arbor",
};

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

export function AboutApp() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="app-content h-full overflow-y-auto p-6">
      <motion.div
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
        <div className="home-timeline mt-3">
          {experiences.map((exp, index) => (
            <motion.article
              key={`${exp.org}-${exp.period}`}
              className="home-timeline-item"
              initial={reduceMotion ? false : { opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-4%" }}
              transition={{
                delay: index * 0.08,
                duration: 0.55,
                ease: SECTION_EASE,
              }}
            >
              <div className="home-timeline-marker" aria-hidden />
              <div className="home-timeline-content">
                <div className="home-timeline-head">
                  <h4 className="home-timeline-role">{exp.role}</h4>
                  <time className="home-timeline-period">{exp.period}</time>
                </div>
                <p className="home-timeline-org">{exp.org}</p>
                <p className="home-timeline-detail">{exp.detail}</p>
              </div>
            </motion.article>
          ))}
        </div>

        <h3 className="mt-6 text-sm font-semibold text-foreground/80">
          Education
        </h3>
        <div className="home-edu-card">
          <h4 className="home-edu-degree">{education.degree}</h4>
          <p className="home-edu-detail">{education.detail}</p>
          <p className="home-edu-school">{education.school}</p>
        </div>

        <h3 className="mt-6 text-sm font-semibold text-foreground/80">
          Skills
        </h3>
        <div className="home-skill-cloud">
          {skills.map((skill, index) => (
            <motion.span
              key={skill}
              className="home-skill-pill"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04, duration: 0.35 }}
            >
              {skill}
            </motion.span>
          ))}
        </div>

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
