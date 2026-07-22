"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { DESKTOP_ASSETS } from "@/config/assets";
import {
  EXPERIENCES,
  FOCUS_AREAS,
  PROFILE,
  SKILLS,
} from "@/data/profile";
import { getFeaturedProjects } from "@/data/projects";
import { useWindowStore } from "@/store/windowStore";
import { HomeActionButton } from "./HomeActionButton";

const SECTION_EASE = [0.22, 1, 0.36, 1] as const;

function HomeSection({
  title,
  eyebrow,
  children,
  delay = 0,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className="home-section"
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px -6% 0px" }}
      transition={{ duration: 0.65, ease: SECTION_EASE, delay }}
    >
      {eyebrow ? <p className="home-section-eyebrow">{eyebrow}</p> : null}
      <h2 className="home-section-title">{title}</h2>
      {children}
    </motion.section>
  );
}

export function HomeApp() {
  const openApp = useWindowStore((s) => s.openApp);
  const scrollRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const featured = getFeaturedProjects();

  const { scrollYProgress } = useScroll({
    container: scrollRef,
    offset: ["start start", "end end"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.25,
  });
  const heroY = useTransform(smoothProgress, [0, 0.35], [0, reduceMotion ? 0 : -48]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.22], [1, 0.55]);
  const blobScale = useTransform(smoothProgress, [0, 1], [1, 1.18]);

  return (
    <div ref={scrollRef} className="app-content home-app h-full overflow-y-auto">
      <motion.div
        className="home-hero-blob"
        style={{ scale: reduceMotion ? 1 : blobScale }}
        aria-hidden
      />

      <motion.header
        className="home-hero"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        <motion.img
          src={DESKTOP_ASSETS.characterCoding}
          alt=""
          className="home-character"
          draggable={false}
          animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
          transition={
            reduceMotion
              ? undefined
              : { duration: 4.2, repeat: Infinity, ease: "easeInOut" }
          }
        />

        <motion.p
          className="home-hero-eyebrow"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.5 }}
        >
          Welcome to my desktop
        </motion.p>

        <motion.h1
          className="home-hero-title"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.55, ease: SECTION_EASE }}
        >
          Hi, I&apos;m{" "}
          <span className="home-hero-name">{PROFILE.name}</span>
        </motion.h1>

        <motion.p
          className="home-hero-tagline"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.55 }}
        >
          {PROFILE.tagline} I explore the intersection of{" "}
          <strong>systems engineering</strong> and{" "}
          <strong>human behavior</strong>.
        </motion.p>

        <motion.div
          className="home-scroll-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          aria-hidden
        >
          <span className="home-scroll-hint-text">Scroll to explore</span>
          <motion.span
            className="home-scroll-hint-chevron"
            animate={reduceMotion ? undefined : { y: [0, 5, 0] }}
            transition={
              reduceMotion
                ? undefined
                : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
            }
          >
            ↓
          </motion.span>
        </motion.div>
      </motion.header>

      <div className="home-body">
        <HomeSection title="Who I am" eyebrow="About">
          <p className="home-prose">{PROFILE.intro}</p>
        </HomeSection>

        <HomeSection title="What I focus on" eyebrow="Interests">
          <div className="home-focus-grid">
            {FOCUS_AREAS.map((area, index) => (
              <motion.div
                key={area.label}
                className="home-focus-card"
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-4%" }}
                transition={{
                  delay: index * 0.06,
                  duration: 0.5,
                  ease: SECTION_EASE,
                }}
                whileHover={reduceMotion ? undefined : { y: -4, scale: 1.02 }}
              >
                <span className="home-focus-emoji" aria-hidden>
                  {area.emoji}
                </span>
                <span className="home-focus-label">{area.label}</span>
              </motion.div>
            ))}
          </div>
        </HomeSection>

        <HomeSection title="Where I've worked" eyebrow="Experience">
          <div className="home-timeline">
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
                    <h3 className="home-timeline-role">{exp.role}</h3>
                    <time className="home-timeline-period">{exp.period}</time>
                  </div>
                  <p className="home-timeline-org">{exp.org}</p>
                  <p className="home-timeline-detail">{exp.detail}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </HomeSection>

        <HomeSection title="Selected work" eyebrow="Projects">
          <div className="home-project-grid">
            {featured.map((project, index) => (
              <motion.button
                key={project.slug}
                type="button"
                className="home-project-card"
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-4%" }}
                transition={{
                  delay: index * 0.07,
                  duration: 0.55,
                  ease: SECTION_EASE,
                }}
                whileHover={reduceMotion ? undefined : { y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openApp("projects", project.slug)}
              >
                <span className="home-project-tag">{project.category}</span>
                <h3 className="home-project-title">{project.title}</h3>
                <p className="home-project-tagline">{project.tagline}</p>
                <p className="home-project-stack">
                  {project.techStack.slice(0, 4).join(" · ")}
                </p>
              </motion.button>
            ))}
          </div>
          <motion.button
            type="button"
            className="home-text-link"
            whileHover={{ x: 4 }}
            onClick={() => openApp("projects")}
          >
            Browse all projects →
          </motion.button>
        </HomeSection>

        <HomeSection title="Education & tools" eyebrow="Background">
          <div className="home-edu-card">
            <h3 className="home-edu-degree">{PROFILE.education.degree}</h3>
            <p className="home-edu-detail">{PROFILE.education.detail}</p>
            <p className="home-edu-school">{PROFILE.education.school}</p>
          </div>
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
        </HomeSection>

        <motion.footer
          className="home-footer"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: SECTION_EASE }}
        >
          <p className="home-footer-text">
            Want to collaborate or chat about systems, research, or internships?
          </p>
          <HomeActionButton
            label="Get in touch"
            subtitle="Open Contact"
            color="#34C759"
            onClick={() => openApp("contact")}
          />
        </motion.footer>
      </div>
    </div>
  );
}
