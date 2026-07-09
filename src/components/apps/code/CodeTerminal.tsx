"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CODE_PROJECT, PROJECT_NAME, getFile } from "./codeFiles";
import type { CodeFolder } from "./codeFiles";
import { useCodeStore } from "./codeStore";
import { useWindowStore } from "@/store/windowStore";

interface TerminalEntry {
  input: string;
  output: string;
}

const HELP_TEXT = `Available commands:
  help          show this message
  ls [dir]      list files
  cat <file>    print a file
  open <file>   open a file in the editor
  echo <text>   echo text
  pwd           print working directory
  whoami        who are you?
  theme         toggle dark/light mode
  clear         clear the terminal`;

function findFolder(path: string): CodeFolder | null {
  if (path === "" || path === ".") return CODE_PROJECT;
  let current: CodeFolder = CODE_PROJECT;
  for (const segment of path.split("/")) {
    const next = current.children.find(
      (child) => child.type === "folder" && child.name === segment
    );
    if (!next || next.type !== "folder") return null;
    current = next;
  }
  return current;
}

function listEntries(folder: CodeFolder): string {
  return folder.children
    .map((child) => (child.type === "folder" ? `${child.name}/` : child.name))
    .join("  ");
}

export function CodeTerminal() {
  const [entries, setEntries] = useState<TerminalEntry[]>([
    { input: "", output: `bh-shell on ${PROJECT_NAME}. Type 'help' to begin.` },
  ]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const openFile = useCodeStore((s) => s.openFile);
  const buffers = useCodeStore((s) => s.buffers);
  const toggleTheme = useWindowStore((s) => s.toggleTheme);

  useEffect(() => {
    bottomRef.current?.scrollIntoView?.({ block: "end" });
  }, [entries]);

  const runCommand = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      const [cmd, ...args] = trimmed.split(/\s+/);
      const arg = args.join(" ");
      let output = "";

      switch (cmd) {
        case "":
          return;
        case "help":
          output = HELP_TEXT;
          break;
        case "ls": {
          const folder = findFolder(arg.replace(/\/$/, ""));
          output = folder
            ? listEntries(folder)
            : `ls: no such directory: ${arg}`;
          break;
        }
        case "cat": {
          const file = getFile(arg);
          output = file
            ? buffers[file.path] ?? file.content
            : `cat: no such file: ${arg || "(missing operand)"}`;
          break;
        }
        case "open": {
          const file = getFile(arg);
          if (file) {
            openFile(file.path);
            output = `Opening ${file.path} in editor...`;
          } else {
            output = `open: no such file: ${arg || "(missing operand)"}`;
          }
          break;
        }
        case "echo":
          output = arg;
          break;
        case "pwd":
          output = `/home/brian/${PROJECT_NAME}`;
          break;
        case "whoami":
          output = "brian";
          break;
        case "theme":
          toggleTheme();
          output = "Theme toggled.";
          break;
        case "clear":
          setEntries([]);
          return;
        case "rm":
          output = "rm: permission denied (nice try)";
          break;
        case "sudo":
          output = "brian is not in the sudoers file. This incident will be reported.";
          break;
        case "vim":
        case "nano":
        case "emacs":
          output = `${cmd}: you're already in an editor :)`;
          break;
        default:
          output = `zsh: command not found: ${cmd}. Type 'help' for options.`;
      }

      setEntries((prev) => [...prev, { input: trimmed, output }]);
    },
    [buffers, openFile, toggleTheme]
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (input.trim()) {
      runCommand(input);
    }
    setInput("");
  };

  return (
    <div className="code-terminal" onClick={() => inputRef.current?.focus()}>
      <div className="code-terminal-header">
        <span className="code-terminal-tab">TERMINAL</span>
        <span className="code-terminal-shell">zsh - {PROJECT_NAME}</span>
      </div>
      <div className="code-terminal-scroll">
        {entries.map((entry, i) => (
          <div key={i}>
            {entry.input && (
              <p className="code-terminal-line">
                <span className="code-terminal-prompt">
                  brian@portfolio {PROJECT_NAME} %{" "}
                </span>
                {entry.input}
              </p>
            )}
            {entry.output && (
              <pre className="code-terminal-output">{entry.output}</pre>
            )}
          </div>
        ))}
        <form onSubmit={handleSubmit} className="code-terminal-input-row">
          <span className="code-terminal-prompt">
            brian@portfolio {PROJECT_NAME} %{" "}
          </span>
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="code-terminal-input"
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            aria-label="Terminal input"
          />
        </form>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
