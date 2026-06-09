"use client";

import { motion } from "framer-motion";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  index: number;
}

export function ProjectCard({ project, onClick, index }: ProjectCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="group w-full border-b border-foreground/8 py-4 text-left transition-colors last:border-b-0 hover:text-sky-400/90"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold transition-colors group-hover:text-sky-400">
          {project.title}
        </h3>
        {project.featured && (
          <span className="shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-500">
            Featured
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-foreground/50 line-clamp-2">
        {project.tagline}
      </p>
      <div className="mt-2 flex flex-wrap gap-1">
        {project.techStack.slice(0, 4).map((tech) => (
          <span
            key={tech}
            className="text-[10px] text-foreground/40"
          >
            {tech}
          </span>
        ))}
        {project.techStack.length > 4 && (
          <span className="text-[10px] text-foreground/30">
            +{project.techStack.length - 4}
          </span>
        )}
      </div>
    </motion.button>
  );
}
