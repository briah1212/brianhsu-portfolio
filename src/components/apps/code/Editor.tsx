"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import type { CodeLanguage } from "./codeFiles";
import { tokenize } from "./highlight";
import { useCodeStore } from "./codeStore";

export const EDITOR_LINE_HEIGHT = 20;

export interface CursorPosition {
  line: number;
  col: number;
}

interface EditorProps {
  path: string;
  language: CodeLanguage;
  value: string;
  onChange: (content: string) => void;
  onSave: () => void;
  onCursorChange: (position: CursorPosition) => void;
}

function cursorFromIndex(value: string, index: number): CursorPosition {
  const before = value.slice(0, index);
  const lastNewline = before.lastIndexOf("\n");
  return {
    line: before.split("\n").length,
    col: index - lastNewline,
  };
}

export function Editor({
  path,
  language,
  value,
  onChange,
  onSave,
  onCursorChange,
}: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const reveal = useCodeStore((s) => s.reveal);
  const clearReveal = useCodeStore((s) => s.clearReveal);

  const tokens = useMemo(() => tokenize(value, language), [value, language]);
  const lineCount = useMemo(() => value.split("\n").length, [value]);

  const syncScroll = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    if (highlightRef.current) {
      highlightRef.current.style.transform = `translate(${-textarea.scrollLeft}px, ${-textarea.scrollTop}px)`;
    }
    if (gutterRef.current) {
      gutterRef.current.style.transform = `translateY(${-textarea.scrollTop}px)`;
    }
  }, []);

  const reportCursor = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    onCursorChange(cursorFromIndex(textarea.value, textarea.selectionStart));
  }, [onCursorChange]);

  // Jump to a line requested by search results
  useEffect(() => {
    if (!reveal || reveal.path !== path) return;
    const textarea = textareaRef.current;
    if (!textarea) return;

    const lines = textarea.value.split("\n");
    const lineIndex = Math.min(reveal.line, lines.length) - 1;
    const charIndex = lines
      .slice(0, lineIndex)
      .reduce((sum, line) => sum + line.length + 1, 0);

    textarea.focus();
    textarea.setSelectionRange(
      charIndex,
      charIndex + (lines[lineIndex]?.length ?? 0)
    );
    textarea.scrollTop = Math.max(
      0,
      lineIndex * EDITOR_LINE_HEIGHT - textarea.clientHeight / 2
    );
    syncScroll();
    reportCursor();
    clearReveal();
  }, [reveal, path, clearReveal, syncScroll, reportCursor]);

  useEffect(() => {
    syncScroll();
  }, [value, syncScroll]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        onSave();
        return;
      }

      if (event.key === "Tab") {
        event.preventDefault();
        const textarea = event.currentTarget;
        // execCommand keeps the browser undo stack intact where available
        if (
          typeof document.execCommand === "function" &&
          document.execCommand("insertText", false, "  ")
        ) {
          return;
        }
        const { selectionStart, selectionEnd } = textarea;
        const next =
          textarea.value.slice(0, selectionStart) +
          "  " +
          textarea.value.slice(selectionEnd);
        onChange(next);
        requestAnimationFrame(() => {
          textarea.setSelectionRange(selectionStart + 2, selectionStart + 2);
        });
      }
    },
    [onChange, onSave]
  );

  return (
    <div className="code-editor">
      <div className="code-gutter" aria-hidden>
        <div ref={gutterRef} className="code-gutter-inner">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i} className="code-gutter-line">
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      <div className="code-editor-surface">
        <pre ref={highlightRef} className="code-highlight" aria-hidden>
          <code>
            {tokens.map((token, i) =>
              token.type === "plain" ? (
                token.text
              ) : (
                <span key={i} className={`tok-${token.type}`}>
                  {token.text}
                </span>
              )
            )}
            {"\n"}
          </code>
        </pre>
        <textarea
          ref={textareaRef}
          className="code-input"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            reportCursor();
          }}
          onKeyDown={handleKeyDown}
          onKeyUp={reportCursor}
          onClick={reportCursor}
          onScroll={syncScroll}
          wrap="off"
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          aria-label={`Editor: ${path}`}
        />
      </div>
    </div>
  );
}
