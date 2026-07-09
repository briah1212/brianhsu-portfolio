"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getAllProjects, getProjectBySlug, getProjectsByCategory } from "@/data/projects";
import { PROJECT_CATEGORIES, getCategoryConfig } from "@/config/categories";
import { PROFILE, EXPERIENCES, SKILLS, FOCUS_AREAS } from "@/data/profile";
import { useWindowStore } from "@/store/windowStore";
import type { ProjectCategory } from "@/types";

interface HistoryEntry {
  input: string;
  output: string;
}

// Virtual filesystem types
type FileNode = {
  type: "file";
  content: string | (() => string);
};

type DirNode = {
  type: "dir";
  children: Record<string, FileNode | DirNode>;
};

type FSNode = FileNode | DirNode;

// Command registry for extensibility
type CommandHandler = (args: string[]) => string | void;

const ASCII_LOGO = `
    ____       _             ____  ____  
   | __ ) _ __(_) __ _ _ __ / __ \\/ ___| 
   |  _ \\| '__| |/ _\` | '_ \\| |  | \\___ \\ 
   | |_) | |  | | (_| | | | | |__| |___) |
   |____/|_|  |_|\\__,_|_| |_|\\____/|____/ 
`;

const CHANGELOG = `v1.3.0 (Jan 2026)
  • Virtual filesystem with portfolio-focused structure
  • Enhanced cd, ls, pwd, cat with full path support
  • Added grep, find commands
  • Path resolution (., .., ~, absolute/relative)
  • Enhanced tab completion for filesystem paths

v1.2.0 (Jan 2026)
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

// Build virtual filesystem from project data
function buildFilesystem(): DirNode {
  const projects = getAllProjects();
  
  // Helper to create project directory with files
  const createProjectDir = (slug: string): DirNode => {
    const project = getProjectBySlug(slug);
    if (!project) return { type: "dir", children: {} };
    
    const category = getCategoryConfig(project.category);
    
    return {
      type: "dir",
      children: {
        "README.md": {
          type: "file",
          content: `# ${project.title}

${project.tagline}

## Category
${category?.icon} ${category?.title}

## Tech Stack
${project.techStack.map(t => `- ${t}`).join("\n")}

## Overview
${project.description || project.problem}

${project.solution ? `## Solution\n${project.solution}` : ""}

${project.learned ? `## Key Learnings\n${project.learned}` : ""}

${project.links && project.links.length > 0 ? `## Links\n${project.links.map(l => `- [${l.label}](${l.url})`).join("\n")}` : ""}
`
        },
        "tech-stack.txt": {
          type: "file",
          content: project.techStack.join("\n")
        },
        ...(project.approach || project.solution ? {
          "details.txt": {
            type: "file",
            content: `Problem:\n${project.problem}\n\n${project.approach ? `Approach:\n${project.approach}\n\n` : ""}${project.solution ? `Solution:\n${project.solution}` : ""}`
          }
        } : {})
      }
    };
  };
  
  // Build work directories
  const workDirs: Record<string, DirNode> = {};
  const workProjects = getProjectsByCategory("work");
  workProjects.forEach(p => {
    workDirs[p.slug] = createProjectDir(p.slug);
  });
  
  // Build other category directories
  const academicsProjects = getProjectsByCategory("academics");
  const academicsDirs: Record<string, DirNode> = {};
  academicsProjects.forEach(p => {
    academicsDirs[p.slug] = createProjectDir(p.slug);
  });
  
  const researchProjects = getProjectsByCategory("research");
  const researchDirs: Record<string, DirNode> = {};
  researchProjects.forEach(p => {
    researchDirs[p.slug] = createProjectDir(p.slug);
  });
  
  const systemsProjects = getProjectsByCategory("systems");
  const systemsDirs: Record<string, DirNode> = {};
  systemsProjects.forEach(p => {
    systemsDirs[p.slug] = createProjectDir(p.slug);
  });
  
  const personalProjects = getProjectsByCategory("personal");
  const personalDirs: Record<string, DirNode> = {};
  personalProjects.forEach(p => {
    personalDirs[p.slug] = createProjectDir(p.slug);
  });
  
  return {
    type: "dir",
    children: {
      portfolio: {
        type: "dir",
        children: {
          work: {
            type: "dir",
            children: {
              ...workDirs,
              "README.md": {
                type: "file",
                content: `# Work Experience

${EXPERIENCES.map(exp => `## ${exp.org} (${exp.period})
**${exp.role}**

${exp.detail}
`).join("\n")}

## Projects
${workProjects.map(p => `- ${p.slug}: ${p.title}`).join("\n")}`
              }
            }
          },
          academics: {
            type: "dir",
            children: {
              ...academicsDirs,
              "README.md": {
                type: "file",
                content: `# Academic Work

## Education
${PROFILE.education.degree}
${PROFILE.education.school}
${PROFILE.education.detail}

## Projects
${academicsProjects.map(p => `- ${p.slug}: ${p.title}`).join("\n")}`
              }
            }
          },
          research: {
            type: "dir",
            children: {
              ...researchDirs,
              "README.md": {
                type: "file",
                content: `# Research Projects

Focus areas:
${FOCUS_AREAS.map(f => `${f.emoji} ${f.label}`).join("\n")}

## Projects
${researchProjects.map(p => `- ${p.slug}: ${p.title}`).join("\n")}`
              }
            }
          },
          systems: {
            type: "dir",
            children: {
              ...systemsDirs,
              "README.md": {
                type: "file",
                content: `# Systems Projects

## Projects
${systemsProjects.map(p => `- ${p.slug}: ${p.title}`).join("\n")}`
              }
            }
          },
          personal: {
            type: "dir",
            children: {
              ...personalDirs,
              "README.md": {
                type: "file",
                content: `# Personal Projects

## Projects
${personalProjects.map(p => `- ${p.slug}: ${p.title}`).join("\n")}`
              }
            }
          }
        }
      },
      home: {
        type: "dir",
        children: {
          brian: {
            type: "dir",
            children: {
              "resume.txt": {
                type: "file",
                content: () => `${PROFILE.name}
${PROFILE.education.degree}
${PROFILE.education.school}
${PROFILE.education.detail}

${PROFILE.intro}

## Experience

${EXPERIENCES.map(exp => `${exp.org} (${exp.period})
${exp.role}
${exp.detail}
`).join("\n")}

## Skills
${SKILLS.join(", ")}

## Focus Areas
${FOCUS_AREAS.map(f => `${f.emoji} ${f.label}`).join("\n")}`
              },
              "contact.txt": {
                type: "file",
                content: `${PROFILE.name}
${PROFILE.education.school}
Ann Arbor, MI

Use the 'contact' command to open the contact form.
Use the 'about' command to learn more.`
              },
              "skills.txt": {
                type: "file",
                content: `Technical Skills:
${SKILLS.join("\n")}

Focus Areas:
${FOCUS_AREAS.map(f => `${f.emoji} ${f.label}`).join("\n")}`
              }
            }
          }
        }
      },
      about: {
        type: "dir",
        children: {
          "README.md": {
            type: "file",
            content: `# About ${PROFILE.name}

${PROFILE.intro}

${PROFILE.tagline}

Type 'neofetch' for system info.
Type 'ls /portfolio' to explore projects.`
          }
        }
      }
    }
  };
}

// Path resolution utilities
function normalizePath(path: string): string {
  const parts = path.split("/").filter(p => p && p !== ".");
  const result: string[] = [];
  
  for (const part of parts) {
    if (part === "..") {
      result.pop();
    } else {
      result.push(part);
    }
  }
  
  return "/" + result.join("/");
}

function resolvePath(current: string, target: string): string {
  if (target === "~") return "/home/brian";
  if (target.startsWith("~/")) return "/home/brian/" + target.slice(2);
  if (target.startsWith("/")) return normalizePath(target);
  
  // Relative path
  const base = current === "/" ? "" : current;
  return normalizePath(base + "/" + target);
}

function getNode(fs: DirNode, path: string): FSNode | null {
  const normalized = normalizePath(path);
  if (normalized === "/") return fs;
  
  const parts = normalized.split("/").filter(Boolean);
  let current: FSNode = fs;
  
  for (const part of parts) {
    if (current.type !== "dir") return null;
    current = current.children[part];
    if (!current) return null;
  }
  
  return current;
}

function listDir(fs: DirNode, path: string): string[] | null {
  const node = getNode(fs, path);
  if (!node || node.type !== "dir") return null;
  return Object.keys(node.children).sort();
}

function readFile(fs: DirNode, path: string): string | null {
  const node = getNode(fs, path);
  if (!node || node.type !== "file") return null;
  return typeof node.content === "function" ? node.content() : node.content;
}

export function TerminalApp() {
  const [history, setHistory] = useState<HistoryEntry[]>([
    { input: "", output: "Welcome to bh-terminal v1.3. Type 'help' to explore the virtual filesystem." },
  ]);
  const [input, setInput] = useState("");
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [cwd, setCwd] = useState("/home/brian"); // Current working directory
  const [filesystem] = useState(() => buildFilesystem()); // Build filesystem once
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const openApp = useWindowStore((s) => s.openApp);
  const toggleTheme = useWindowStore((s) => s.toggleTheme);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  // Command handlers
  const commandRegistry: Record<string, CommandHandler> = {
    help: () => {
      return `Available commands:
  Navigation:
    pwd                    — print working directory
    ls [path]              — list directory contents
    cd <path>              — change directory (supports /, ~, .., relative paths)
    cat <file>             — display file contents
    find <pattern>         — find files matching pattern
    grep <pattern> <file>  — search for pattern in file
    
  Portfolio (legacy):
    open <slug>            — open project case study window
    
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
    • Virtual filesystem mapped to portfolio structure
    • Use Tab for path/command auto-completion
    • Use ↑/↓ arrows for command history
    • Try: cd /portfolio/work && ls`;
    },

    pwd: () => {
      return cwd;
    },

    ls: (args) => {
      const target = args.join(" ") || cwd;
      const path = resolvePath(cwd, target);
      
      // Legacy behavior for "ls folders" and "ls projects"
      if (args[0] === "folders") {
        return PROJECT_CATEGORIES
          .map(c => `  ${c.icon} ${c.id.padEnd(12)} — ${c.title}`)
          .join("\n");
      }
      
      if (args[0] === "projects") {
        const projects = getAllProjects();
        const byCategory = PROJECT_CATEGORIES.map(cat => {
          const catProjects = projects.filter(p => p.category === cat.id);
          if (catProjects.length === 0) return null;
          return `\n${cat.icon} ${cat.title}:\n${catProjects.map(p => `  • ${p.slug} — ${p.title}`).join("\n")}`;
        }).filter(Boolean).join("\n");
        return byCategory || "No projects found.";
      }
      
      const items = listDir(filesystem, path);
      if (items === null) {
        return `ls: cannot access '${target}': No such file or directory`;
      }
      
      // Check which items are directories
      const formatted = items.map(item => {
        const itemPath = path === "/" ? `/${item}` : `${path}/${item}`;
        const node = getNode(filesystem, itemPath);
        return node?.type === "dir" ? `${item}/` : item;
      });
      
      return formatted.join("\n");
    },

    cd: (args) => {
      const target = args.join(" ");
      
      if (!target) {
        setCwd("/home/brian");
        return;
      }
      
      // Legacy behavior: if target matches a project category, open the folder
      const category = PROJECT_CATEGORIES.find(c => c.id === target.toLowerCase());
      if (category && !target.includes("/")) {
        openApp("projects", target as ProjectCategory);
        const projectCount = getProjectsByCategory(target as ProjectCategory).length;
        return `Opening ${category.title} folder (${projectCount} project${projectCount !== 1 ? 's' : ''})...\nFilesystem path: /portfolio/${target}`;
      }
      
      const newPath = resolvePath(cwd, target);
      const node = getNode(filesystem, newPath);
      
      if (!node) {
        return `cd: no such file or directory: ${target}`;
      }
      
      if (node.type !== "dir") {
        return `cd: not a directory: ${target}`;
      }
      
      setCwd(newPath);
      return;
    },

    cat: (args) => {
      const target = args.join(" ");
      
      if (!target) {
        return "Usage: cat <file>";
      }
      
      // Legacy behavior: try to match project slug first
      const project = getProjectBySlug(target);
      if (project && !target.includes("/")) {
        const category = getCategoryConfig(project.category);
        return `${category?.icon} ${project.title}
${"─".repeat(50)}
Category: ${category?.title}
Tech: ${project.techStack.slice(0, 5).join(", ")}${project.techStack.length > 5 ? "..." : ""}

${project.tagline}

Problem:
${project.problem}

Use 'open ${target}' to view full case study.`;
      }
      
      const path = resolvePath(cwd, target);
      const content = readFile(filesystem, path);
      
      if (content === null) {
        return `cat: ${target}: No such file or directory`;
      }
      
      return content;
    },

    find: (args) => {
      const pattern = args.join(" ").toLowerCase();
      
      if (!pattern) {
        return "Usage: find <pattern>";
      }
      
      const results: string[] = [];
      
      const search = (node: FSNode, path: string) => {
        if (node.type === "file") {
          if (path.toLowerCase().includes(pattern)) {
            results.push(path);
          }
        } else {
          Object.entries(node.children).forEach(([name, child]) => {
            const childPath = path === "/" ? `/${name}` : `${path}/${name}`;
            if (name.toLowerCase().includes(pattern)) {
              results.push(childPath);
            }
            if (child.type === "dir") {
              search(child, childPath);
            }
          });
        }
      };
      
      const startPath = cwd;
      const startNode = getNode(filesystem, startPath);
      if (startNode) {
        search(startNode, startPath);
      }
      
      return results.length > 0 
        ? results.join("\n") 
        : `find: no matches for '${pattern}'`;
    },

    grep: (args) => {
      if (args.length < 2) {
        return "Usage: grep <pattern> <file>";
      }
      
      const pattern = args[0].toLowerCase();
      const target = args.slice(1).join(" ");
      const path = resolvePath(cwd, target);
      const content = readFile(filesystem, path);
      
      if (content === null) {
        return `grep: ${target}: No such file or directory`;
      }
      
      const lines = content.split("\n");
      const matches = lines
        .map((line, idx) => ({ line, num: idx + 1 }))
        .filter(({ line }) => line.toLowerCase().includes(pattern));
      
      if (matches.length === 0) {
        return `grep: no matches for '${pattern}' in ${target}`;
      }
      
      return matches
        .map(({ line, num }) => `${num}:${line}`)
        .join("\n");
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
OS:          Brian OS v1.3
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
    
    echo: (args) => args.join(" "),
  };

  const addToHistory = useCallback((input: string, output: string) => {
    setHistory((h) => [...h, { input, output }]);
  }, []);

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

    // Path completion for filesystem commands
    if (["cd", "ls", "cat", "grep"].includes(cmd)) {
      const partial = parts.slice(1).join(" ");
      const targetPath = partial || cwd;
      const parentPath = partial.includes("/") 
        ? resolvePath(cwd, partial.substring(0, partial.lastIndexOf("/")))
        : cwd;
      
      const items = listDir(filesystem, parentPath);
      if (!items) return;
      
      const prefix = partial.includes("/") ? partial.substring(0, partial.lastIndexOf("/") + 1) : "";
      const searchTerm = partial.includes("/") ? partial.substring(partial.lastIndexOf("/") + 1) : partial;
      
      const matches = items.filter(item => item.startsWith(searchTerm));
      
      if (matches.length === 1) {
        setInput(`${cmd} ${prefix}${matches[0]}`);
      } else if (matches.length > 1) {
        addToHistory(trimmed, matches.join("  "));
      }
      return;
    }

    // Legacy completion for open command (project slugs)
    if (cmd === "open") {
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
    }
  }, [input, cwd, filesystem, addToHistory, commandRegistry]);

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
    [openApp, toggleTheme, addToHistory, cwd, filesystem]
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
                <span className="text-blue-400">{cwd}</span>
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
        <span className="text-blue-400">{cwd}</span>
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
