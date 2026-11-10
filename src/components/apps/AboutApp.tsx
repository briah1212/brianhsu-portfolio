"use client";

import { motion, useReducedMotion } from "framer-motion";
import { FileDown } from "lucide-react";
import {
  CONTACT,
  EXPERIENCES,
  FOCUS_AREAS,
  PROFILE,
  SKILLS,
} from "@/data/profile";

const SECTION_EASE = [0.22, 1, 0.36, 1] as const;

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
          {PROFILE.tagline} {PROFILE.intro}
        </p>

        <h3 className="mt-6 text-sm font-semibold text-foreground/80">
          Focus Areas
        </h3>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
          {FOCUS_AREAS.map((item) => (
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
          {EXPERIENCES.map((exp, index) => (
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
          <h4 className="home-edu-degree">{PROFILE.education.degree}</h4>
          <p className="home-edu-detail">{PROFILE.education.detail}</p>
          <p className="home-edu-school">{PROFILE.education.school}</p>
        </div>

        <h3 className="mt-6 text-sm font-semibold text-foreground/80">
          Skills
        </h3>
        <div className="home-skill-cloud">
          {SKILLS.map((skill, index) => (
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
          href={CONTACT.resume}
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
