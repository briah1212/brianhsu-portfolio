"use client";

import { motion } from "framer-motion";
import { FileDown, Globe, Link2, Mail } from "lucide-react";

const links = [
  {
    label: "Email",
    value: "hsubrian1212@gmail.com",
    href: "mailto:hsubrian1212@gmail.com",
    icon: Mail,
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/brianhsuu",
    href: "https://linkedin.com/in/brianhsuu",
    icon: Link2,
  },
  {
    label: "GitHub",
    value: "github.com/brianhsu",
    href: "https://github.com/brianhsu",
    icon: Globe,
  },
];

export function ContactApp() {
  return (
    <div className="app-content flex h-full flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <h2 className="text-lg font-semibold text-center">Get in Touch</h2>
        <p className="mt-2 text-center text-xs text-foreground/50">
          Open to internships, research collaborations, and interesting
          conversations.
        </p>

        <div className="mt-6 space-y-2">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("mailto") ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="flex items-center gap-3 py-2 transition-colors hover:text-sky-400"
            >
              <link.icon size={16} className="shrink-0 text-foreground/45" />
              <div>
                <p className="text-xs font-medium">{link.label}</p>
                <p className="text-[11px] text-foreground/45">{link.value}</p>
              </div>
            </a>
          ))}
        </div>

        <a
          href="/Resume.pdf"
          className="mt-4 flex w-full items-center justify-center gap-2 py-2 text-xs font-medium text-foreground/55 transition-colors hover:text-sky-400"
        >
          <FileDown size={14} />
          Download Resume
        </a>
      </motion.div>
    </div>
  );
}
