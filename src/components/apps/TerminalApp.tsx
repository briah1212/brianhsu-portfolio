"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getAllProjects, getProjectBySlug, getProjectsByCategory } from "@/data/projects";
import { PROJECT_CATEGORIES, getCategoryConfig } from "@/config/categories";
import { PROFILE, EXPERIENCES, SKILLS } from "@/data/profile";
import { useWindowStore } from "@/store/windowStore";
import type { ProjectCategory } from "@/types";

interface HistoryEntry {
  input: string;
  output: string;
}

// Command registry for extensibility
type CommandHandler = (args: string[]) => string | void;

const ASCII_LOGO = `
    ____       _             ____  ____  
   | __ ) _ __(_) __ _ _ __ / __ \\/ ___| 
   |  _ \\| '__| |/ _\` | '_ \\| |  | \\___ \\ 
   | |_) | |  | | (_| | | | | |__| |___) |
   |____/|_|  |_|\\__,_|_| |_|\\____/|____/ 
`;

const CHANGELOG = `v1.2.0 (Jan 2026)
  • Enhanced terminal with command history & tab completion
  • Added ls, cd, cat, neofetch commands
  • Improved project navigation

v1.1.0 (Dec 2025)
  • Added project case studies
  • Desktop folder organization
  • Theme toggle support

v1.0.0 (Nov 2025)
  • Initial release
  • macOS-inspired desktop environment
  • Portfolio showcase with terminal`;

export function TerminalApp() {
  const [history, setHistory] = useState<HistoryEntry[]>([
    { input: "", output: "Welcome to bh-terminal v1.2. Type 'help' or 'neofetch' to explore." },
  ]);
  const [input, setInput] = useState("");
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const openApp = useWindowStore((s) => s.openApp);
  const toggleTheme = useWindowStore((s) => s.toggleTheme);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  // Tab completion logic
  const handleTabComplete = useCallback(() => {
    const trimmed = input.trim();
    const parts = trimmed.split(/\s+/);
    const cmd = parts[0]?.toLowerCase();
    
    // Command completion
    if (parts.length <= 1) {
      const commands = Object.keys(commandRegistry);
      const matches = commands.filter(c => c.startsWith(trimmed.toLowerCase()));
      if (matches.length === 1) {
        setInput(matches[0] + " ");
      } else if (matches.length > 1) {
        addToHistory(trimmed, matches.join("  "));
      }
      return;
    }

    // Argument completion for specific commands
    if (cmd === "open" || cmd === "cat") {
      const partial = parts.slice(1).join(" ").toLowerCase();
      const projects = getAllProjects();
      const matches = projects
        .map(p => p.slug)
        .filter(slug => slug.startsWith(partial));
      
      if (matches.length === 1) {
        setInput(`${cmd} ${matches[0]}`);
      } else if (matches.length > 1) {
        addToHistory(trimmed, matches.join("  "));
      }
    } else if (cmd === "cd") {
      const partial = parts[1]?.toLowerCase() || "";
      const categories = PROJECT_CATEGORIES.map(c => c.id);
      const matches = categories.filter(cat => cat.startsWith(partial));
      
      if (matches.length === 1) {
        setInput(`cd ${matches[0]}`);
      } else if (matches.length > 1) {
        addToHistory(trimmed, matches.join("  "));
      }
    }
  }, [input]);

  // Command handlers
  const commandRegistry: Record<string, CommandHandler> = {
    help: () => {
      return `Available commands:
  Navigation:
    ls [folders|projects]  — list folders or all projects
    cd <folder>            — open a category folder
    open <slug>            — open a project case study
    cat <slug>             — preview project details

  Apps:
    about                  — open About app
    contact                — open Contact app
    
  System:
    whoami                 — show user info
    neofetch               — display system information
    theme                  — toggle dark/light mode
    changelog              — show version history
    clear                  — clear terminal
    help                   — show this message

  Tips:
    • Use Tab for auto-completion
    • Use ↑/↓ arrows for command history`;
    },

    ls: (args) => {
      const target = args[0]?.toLowerCase();
      
      if (!target || target === "folders") {
        return PROJECT_CATEGORIES
          .map(c => `  ${c.icon} ${c.id.padEnd(12)} — ${c.title}`)
          .join("\n");
      }
      
      if (target === "projects") {
        const projects = getAllProjects();
        const byCategory = PROJECT_CATEGORIES.map(cat => {
          const catProjects = projects.filter(p => p.category === cat.id);
          if (catProjects.length === 0) return null;
          return `\n${cat.icon} ${cat.title}:\n${catProjects.map(p => `  • ${p.slug} — ${p.title}`).join("\n")}`;
        }).filter(Boolean).join("\n");
        return byCategory || "No projects found.";
      }
      
      return `Usage: ls [folders|projects]`;
    },

    cd: (args) => {
      const folder = args[0]?.toLowerCase();
      if (!folder) {
        return "Usage: cd <folder>\nAvailable: academics, work, research, systems, personal";
      }
      
      const category = PROJECT_CATEGORIES.find(c => c.id === folder);
      if (!category) {
        return `Folder not found: ${folder}\nTry: ls folders`;
      }
      
      openApp("projects", folder as ProjectCategory);
      const projectCount = getProjectsByCategory(folder as ProjectCategory).length;
      return `Opening ${category.title} (${projectCount} project${projectCount !== 1 ? 's' : ''})...`;
    },

    cat: (args) => {
      const slug = args.join(" ").toLowerCase();
      if (!slug) {
        return "Usage: cat <project-slug>";
      }
      
      const project = getProjectBySlug(slug);
      if (!project) {
        return `Project not found: ${slug}\nTry: ls projects`;
      }
      
      const category = getCategoryConfig(project.category);
      return `${category?.icon} ${project.title}
${"─".repeat(50)}
Category: ${category?.title}
Tech: ${project.techStack.slice(0, 5).join(", ")}${project.techStack.length > 5 ? "..." : ""}

${project.tagline}

Problem:
${project.problem}

Use 'open ${slug}' to view full case study.`;
    },

    open: (args) => {
      const slug = args.join(" ").toLowerCase();
      if (!slug) {
        return "Usage: open <project-slug>";
      }
      
      const projects = getAllProjects();
      if (projects.some(p => p.slug === slug)) {
        openApp("projects", slug);
        return `Opening project: ${slug}`;
      }
      return `Project not found: ${slug}`;
    },

    about: () => {
      openApp("about");
      return "Opening About...";
    },

    contact: () => {
      openApp("contact");
      return "Opening Contact...";
    },

    projects: () => {
      const projects = getAllProjects();
      return projects.map(p => `  • ${p.slug} — ${p.title}`).join("\n");
    },

    whoami: () => {
      return `${PROFILE.name} — CS + CogSci @ UMich\n${PROFILE.tagline}`;
    },

    neofetch: () => {
      const projects = getAllProjects();
      const featuredCount = projects.filter(p => p.featured).length;
      
      return `${ASCII_LOGO}
${PROFILE.name}@portfolio
${"─".repeat(50)}
OS:          Brian OS v1.2
Shell:       bh-terminal
Education:   ${PROFILE.education.degree}
             ${PROFILE.education.school}
Location:    Ann Arbor, MI
Projects:    ${projects.length} total, ${featuredCount} featured
Skills:      ${SKILLS.join(", ")}
Focus:       HPC, Distributed Systems, Scientific Computing

Recent Work:
${EXPERIENCES.slice(0, 2).map(exp => 
  `  ${exp.org} (${exp.period})\n  ${exp.role}`
).join("\n\n")}

Type 'help' for available commands.`;
    },

    theme: () => {
      toggleTheme();
      return "Theme toggled.";
    },

    changelog: () => {
      return CHANGELOG;
    },

    clear: () => {
      setHistory([]);
      return;
    },

    // Easter eggs
    sudo: (args) => {
      const cmd = args.join(" ");
      return cmd 
        ? `[sudo] password for brian: \nNice try! But this is a portfolio, not a real terminal. 🔒`
        : "Usage: sudo <command>";
    },

    exit: () => "Use Cmd+W to close this window.",
    
    pwd: () => "/home/brian/portfolio",
    
    echo: (args) => args.join(" "),
  };

  const addToHistory = useCallback((input: string, output: string) => {
    setHistory((h) => [...h, { input, output }]);
  }, []);

  const runCommand = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      const parts = trimmed.split(/\s+/);
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1);

      const handler = commandRegistry[cmd];
      const output = handler 
        ? handler(args) ?? ""
        : `Command not found: ${cmd}. Type 'help' for options.`;

      if (cmd !== "clear") {
        addToHistory(raw, output);
      }

      // Add to command history
      setCommandHistory(prev => [...prev, trimmed]);
      setHistoryIndex(-1);
    },
    [openApp, toggleTheme, addToHistory]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runCommand(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      handleTabComplete();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      
      const newIndex = historyIndex === -1 
        ? commandHistory.length - 1 
        : Math.max(0, historyIndex - 1);
      
      setHistoryIndex(newIndex);
      setInput(commandHistory[newIndex] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === -1) return;
      
      const newIndex = historyIndex + 1;
      if (newIndex >= commandHistory.length) {
        setHistoryIndex(-1);
        setInput("");
      } else {
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex] || "");
      }
    }
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
              <p className="text-green-400">
                <span className="text-green-500">brian@portfolio</span>
                <span className="text-neutral-500">:</span>
                <span className="text-blue-400">~</span>
                <span className="text-neutral-500">$ </span>
                {entry.input}
              </p>
            )}
            <pre className="whitespace-pre-wrap text-neutral-300">
              {entry.output}
            </pre>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex items-center border-t border-white/5 px-4 py-2">
        <span className="shrink-0 text-green-500">brian@portfolio</span>
        <span className="text-neutral-500">:</span>
        <span className="text-blue-400">~</span>
        <span className="text-neutral-500">$&nbsp;</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none text-green-400 caret-green-400"
          autoFocus
          spellCheck={false}
        />
      </form>
    </div>
  );
}
