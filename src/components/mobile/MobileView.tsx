"use client";

import { FileDown, Globe, Link2, Mail } from "lucide-react";
import { EXPERIENCES, PROFILE, SKILLS } from "@/data/profile";
import { getFeaturedProjects } from "@/data/projects";

const PROOF_PATHS = [
  {
    label: "Infrastructure Systems",
    description: "HPC clusters, bare-metal provisioning, distributed systems, networking",
    emoji: "🖥️",
  },
  {
    label: "Data & Analytics Systems",
    description: "Pipelines, measurement, operational analysis, data-informed decisions",
    emoji: "📊",
  },
  {
    label: "Research / ML Tools",
    description: "Scientific computing, ML workflows, cognitive science tools",
    emoji: "🔬",
  },
] as const;

const CONTACT_LINKS = [
  {
    label: "Email",
    href: "mailto:hsubrian1212@gmail.com",
    value: "hsubrian1212@gmail.com",
    icon: Mail,
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/brianhsuu",
    value: "linkedin.com/in/brianhsuu",
    icon: Link2,
  },
  {
    label: "GitHub",
    href: "https://github.com/brianhsu",
    value: "github.com/brianhsu",
    icon: Globe,
  },
] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="px-5 py-8 border-b border-foreground/8 last:border-b-0">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-foreground/40 mb-4">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function MobileView() {
  const featured = getFeaturedProjects();

  return (
    <div className="mobile-view min-h-screen overflow-y-auto bg-background text-foreground">
      {/* Hero / Thesis */}
      <header className="px-5 pt-14 pb-10 border-b border-foreground/8">
        <p className="text-xs font-mono tracking-widest text-foreground/40 uppercase mb-3">
          Proof-of-work portfolio
        </p>
        <h1 className="text-2xl font-semibold leading-snug">
          Hi, I&apos;m <span className="text-sky-400">{PROFILE.name}</span>
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-foreground/65">
          {PROFILE.tagline}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-foreground/55">
          {PROFILE.intro}
        </p>
      </header>

      {/* Proof paths */}
      <Section title="Proof paths">
        <div className="space-y-4">
          {PROOF_PATHS.map((path) => (
            <div key={path.label} className="flex gap-3">
              <span className="text-xl shrink-0 mt-0.5" aria-hidden>
                {path.emoji}
              </span>
              <div>
                <p className="text-sm font-medium">{path.label}</p>
                <p className="mt-0.5 text-xs text-foreground/50">{path.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Featured projects */}
      <Section title="Selected work">
        <div className="space-y-5">
          {featured.map((project) => (
            <div key={project.slug} className="rounded-lg border border-foreground/10 p-4">
              <p className="text-[10px] font-mono uppercase tracking-wider text-foreground/35 mb-1">
                {project.category}
              </p>
              <h3 className="text-sm font-semibold">{project.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-foreground/55">
                {project.tagline}
              </p>
              {project.techStack.length > 0 && (
                <p className="mt-2 text-[10px] text-sky-400/80">
                  {project.techStack.slice(0, 4).join(" · ")}
                </p>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Experience */}
      <Section title="Experience">
        <div className="space-y-5">
          {EXPERIENCES.map((exp) => (
            <div key={`${exp.org}-${exp.period}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{exp.role}</p>
                  <p className="text-xs text-foreground/50">{exp.org}</p>
                </div>
                <time className="shrink-0 text-[10px] text-foreground/35 mt-0.5">
                  {exp.period}
                </time>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-foreground/55">
                {exp.detail}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Skills */}
      <Section title="Skills">
        <p className="text-xs text-foreground/55 leading-relaxed">
          {SKILLS.join(" · ")}
        </p>
        <p className="mt-2 text-xs text-foreground/35">
          {PROFILE.education.degree}
          {" · "}
          {PROFILE.education.school}
        </p>
      </Section>

      {/* Contact */}
      <Section title="Contact">
        <div className="space-y-3">
          {CONTACT_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("mailto") ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm transition-colors hover:text-sky-400"
            >
              <link.icon size={15} className="shrink-0 text-foreground/40" aria-hidden />
              <div>
                <p className="text-xs font-medium">{link.label}</p>
                <p className="text-[11px] text-foreground/40">{link.value}</p>
              </div>
            </a>
          ))}
        </div>

        <a
          href="/Resume.pdf"
          className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-foreground/55 transition-colors hover:text-sky-400"
        >
          <FileDown size={14} aria-hidden />
          Download Resume
        </a>
      </Section>
    </div>
  );
}
