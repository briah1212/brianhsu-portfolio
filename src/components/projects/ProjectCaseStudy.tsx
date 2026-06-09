"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink } from "lucide-react";
import type { Project } from "@/types";

interface ProjectCaseStudyProps {
  project: Project;
  onBack: () => void;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground/40">
        {title}
      </h4>
      <p className="mt-1.5 text-sm leading-relaxed text-foreground/65">
        {children}
      </p>
    </div>
  );
}

export function ProjectCaseStudy({ project, onBack }: ProjectCaseStudyProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="h-full overflow-y-auto p-5"
    >
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1 text-xs text-foreground/50 transition-colors hover:text-foreground/80"
      >
        <ArrowLeft size={14} />
        All Projects
      </button>

      <h2 className="text-lg font-semibold">{project.title}</h2>
      <p className="mt-1 text-sm text-foreground/50">{project.tagline}</p>

      {/* Placeholder screenshot area */}
      <div className="mt-4 flex h-32 items-center justify-center rounded-lg border border-dashed border-foreground/10">
        <span className="text-xs text-foreground/25">
          Screenshot / demo placeholder
        </span>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-foreground/60">
        {project.description}
      </p>

      <p className="mt-3 text-xs text-sky-400/90">
        {project.techStack.join(" · ")}
      </p>

      <Section title="Problem">{project.problem}</Section>
      <Section title="Approach">{project.approach}</Section>
      <Section title="Solution">{project.solution}</Section>
      <Section title="What I Learned">{project.learned}</Section>

      {project.links.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {project.links.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-foreground/55 transition-colors hover:text-sky-400"
            >
              {link.label}
              <ExternalLink size={12} />
            </a>
          ))}
        </div>
      )}
    </motion.div>
  );
}
