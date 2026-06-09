"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getAllProjects } from "@/data/projects";
import { useWindowStore } from "@/store/windowStore";

interface HistoryEntry {
  input: string;
  output: string;
}

const HELP_TEXT = `Available commands:
  help       — show this message
  about      — open About app
  projects   — list all projects
  open <slug>— open a project case study
  contact    — open Contact app
  clear      — clear terminal
  whoami     — who are you?
  theme      — toggle dark/light mode`;

export function TerminalApp() {
  const [history, setHistory] = useState<HistoryEntry[]>([
    { input: "", output: "Welcome to bh-terminal v1.0. Type 'help' to begin." },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const openApp = useWindowStore((s) => s.openApp);
  const toggleTheme = useWindowStore((s) => s.toggleTheme);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const runCommand = useCallback(
    (raw: string) => {
      const cmd = raw.trim().toLowerCase();
      let output = "";

      if (cmd === "help") {
        output = HELP_TEXT;
      } else if (cmd === "about") {
        openApp("about");
        output = "Opening About...";
      } else if (cmd === "contact") {
        openApp("contact");
        output = "Opening Contact...";
      } else if (cmd === "projects") {
        const projects = getAllProjects();
        output = projects.map((p) => `  • ${p.slug} — ${p.title}`).join("\n");
      } else if (cmd.startsWith("open ")) {
        const slug = cmd.slice(5).trim();
        const projects = getAllProjects();
        if (projects.some((p) => p.slug === slug)) {
          openApp("projects", slug);
          output = `Opening project: ${slug}`;
        } else {
          output = `Project not found: ${slug}`;
        }
      } else if (cmd === "clear") {
        setHistory([]);
        return;
      } else if (cmd === "whoami") {
        output = "brianhsu — CS + CogSci @ UMich";
      } else if (cmd === "theme") {
        toggleTheme();
        output = "Theme toggled.";
      } else if (cmd === "") {
        return;
      } else {
        output = `Command not found: ${raw}. Type 'help' for options.`;
      }

      setHistory((h) => [...h, { input: raw, output }]);
    },
    [openApp, toggleTheme]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runCommand(input);
    setInput("");
  };

  return (
    <div
      className="flex h-full flex-col bg-[#1a1a1a] font-mono text-xs text-green-400"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {history.map((entry, i) => (
          <div key={i}>
            {entry.input && (
              <p>
                <span className="text-green-600">brian@portfolio</span>
                <span className="text-foreground/40">:</span>
                <span className="text-blue-400">~</span>
                <span className="text-foreground/40">$ </span>
                {entry.input}
              </p>
            )}
            <pre className="whitespace-pre-wrap text-foreground/70">
              {entry.output}
            </pre>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex items-center border-t border-white/5 px-4 py-2">
        <span className="text-green-600 shrink-0">brian@portfolio</span>
        <span className="text-foreground/40">:</span>
        <span className="text-blue-400">~</span>
        <span className="text-foreground/40">$&nbsp;</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent outline-none text-green-400 caret-green-400"
          autoFocus
          spellCheck={false}
        />
      </form>
    </div>
  );
}
