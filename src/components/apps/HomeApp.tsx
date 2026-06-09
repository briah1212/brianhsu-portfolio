"use client";

import { motion } from "framer-motion";
import { useWindowStore } from "@/store/windowStore";

export function HomeApp() {
  const openApp = useWindowStore((s) => s.openApp);
  return (
    <div className="app-content flex h-full flex-col items-center justify-center p-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md"
      >
        <div className="mx-auto mb-5 text-5xl">👋</div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Hi, I&apos;m{" "}
          <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">
            Brian Hsu
          </span>
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-foreground/60">
          Computer Science &amp; Cognitive Science student exploring the
          intersection of{" "}
          <span className="text-foreground/80">systems engineering</span> and{" "}
          <span className="text-foreground/80">human behavior</span>.
        </p>
        <p className="mt-4 text-xs text-foreground/40">
          Click an app in the dock below to get started — or try the Terminal
          for a surprise.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {(["projects", "about", "contact"] as const).map((app) => (
            <button
              key={app}
              onClick={() => openApp(app)}
              className="px-3 py-1.5 text-xs font-medium text-foreground/55 transition-colors hover:text-sky-400"
            >
              Open {app.charAt(0).toUpperCase() + app.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
