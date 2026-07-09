"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  FileCode,
  FileJson,
  FileText,
  Files,
  Folder,
  FolderOpen,
  GitBranch,
  Hash,
  Moon,
  RefreshCw,
  Search,
  SquareTerminal,
  Sun,
  Undo2,
  X,
} from "lucide-react";
import { useWindowStore } from "@/store/windowStore";
import {
  CODE_PROJECT,
  PROJECT_NAME,
  getAllFiles,
  getFile,
  type CodeFile,
  type CodeLanguage,
  type CodeNode,
} from "./codeFiles";
import { LANGUAGE_LABELS } from "./highlight";
import { isDirty, isModified, useCodeStore, type SidebarView } from "./codeStore";
import { Editor, type CursorPosition } from "./Editor";
import { CodeTerminal } from "./CodeTerminal";

const FILE_ICONS: Record<
  CodeLanguage,
  { Icon: typeof FileText; color: string }
> = {
  json: { Icon: FileJson, color: "#fbbf24" },
  python: { Icon: FileCode, color: "#38bdf8" },
  html: { Icon: FileCode, color: "#fb923c" },
  css: { Icon: Hash, color: "#a78bfa" },
  markdown: { Icon: FileText, color: "#60a5fa" },
  plain: { Icon: FileText, color: "#9ca3af" },
};

function FileIcon({ language }: { language: CodeLanguage }) {
  const { Icon, color } = FILE_ICONS[language];
  return <Icon size={14} style={{ color }} aria-hidden />;
}

/* ── Explorer ── */

interface ExplorerNodeProps {
  node: CodeNode;
  depth: number;
}

function ExplorerNode({ node, depth }: ExplorerNodeProps) {
  const expanded = useCodeStore((s) => s.expandedFolders[node.path]);
  const activePath = useCodeStore((s) => s.activePath);
  const dirty = useCodeStore((s) =>
    node.type === "file" ? isDirty(s, node.path) : false
  );
  const toggleFolder = useCodeStore((s) => s.toggleFolder);
  const openFile = useCodeStore((s) => s.openFile);

  const indent = { paddingLeft: 10 + depth * 14 };

  if (node.type === "folder") {
    return (
      <>
        <button
          className="code-tree-row"
          style={indent}
          onClick={() => toggleFolder(node.path)}
          aria-expanded={expanded}
        >
          {expanded ? (
            <ChevronDown size={13} className="code-tree-chevron" aria-hidden />
          ) : (
            <ChevronRight size={13} className="code-tree-chevron" aria-hidden />
          )}
          {expanded ? (
            <FolderOpen size={14} className="code-tree-folder" aria-hidden />
          ) : (
            <Folder size={14} className="code-tree-folder" aria-hidden />
          )}
          <span className="code-tree-label">{node.name}</span>
        </button>
        {expanded &&
          node.children.map((child) => (
            <ExplorerNode key={child.path} node={child} depth={depth + 1} />
          ))}
      </>
    );
  }

  return (
    <button
      className={`code-tree-row ${
        activePath === node.path ? "code-tree-row-active" : ""
      }`}
      style={indent}
      onClick={() => openFile(node.path)}
    >
      <span className="code-tree-chevron-spacer" />
      <FileIcon language={node.language} />
      <span className="code-tree-label">
        {node.name}
        {dirty && <span className="code-tree-dirty" aria-label="unsaved" />}
      </span>
    </button>
  );
}

function ExplorerView() {
  return (
    <div className="code-sidebar-body">
      <p className="code-sidebar-heading">Explorer</p>
      <p className="code-sidebar-project">{PROJECT_NAME.toUpperCase()}</p>
      <div className="code-tree" role="tree">
        {CODE_PROJECT.children.map((node) => (
          <ExplorerNode key={node.path} node={node} depth={0} />
        ))}
      </div>
    </div>
  );
}

/* ── Search ── */

interface SearchHit {
  file: CodeFile;
  line: number;
  text: string;
}

function SearchView() {
  const [query, setQuery] = useState("");
  const buffers = useCodeStore((s) => s.buffers);
  const openFile = useCodeStore((s) => s.openFile);

  const hits = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length < 2) return [];
    const results: SearchHit[] = [];
    for (const file of getAllFiles()) {
      const content = buffers[file.path] ?? file.content;
      content.split("\n").forEach((text, index) => {
        if (text.toLowerCase().includes(needle)) {
          results.push({ file, line: index + 1, text: text.trim() });
        }
      });
    }
    return results.slice(0, 50);
  }, [query, buffers]);

  const grouped = useMemo(() => {
    const byFile = new Map<string, SearchHit[]>();
    for (const hit of hits) {
      const list = byFile.get(hit.file.path) ?? [];
      list.push(hit);
      byFile.set(hit.file.path, list);
    }
    return byFile;
  }, [hits]);

  return (
    <div className="code-sidebar-body">
      <p className="code-sidebar-heading">Search</p>
      <input
        className="code-search-input"
        placeholder="Search brian-hsu"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        spellCheck={false}
        aria-label="Search files"
      />
      {query.trim().length >= 2 && (
        <p className="code-search-count">
          {hits.length === 0
            ? "No results found."
            : `${hits.length} result${hits.length === 1 ? "" : "s"} in ${grouped.size} file${grouped.size === 1 ? "" : "s"}`}
        </p>
      )}
      <div className="code-search-results">
        {[...grouped.entries()].map(([path, fileHits]) => (
          <div key={path}>
            <div className="code-search-file">
              <FileIcon language={fileHits[0].file.language} />
              <span className="code-tree-label">{fileHits[0].file.name}</span>
              <span className="code-search-badge">{fileHits.length}</span>
            </div>
            {fileHits.map((hit, i) => (
              <button
                key={`${hit.line}-${i}`}
                className="code-search-hit"
                onClick={() => openFile(hit.file.path, hit.line)}
                title={`${path}:${hit.line}`}
              >
                {hit.text || " "}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Source control ── */

function SourceControlView() {
  const buffers = useCodeStore((s) => s.buffers);
  const saved = useCodeStore((s) => s.saved);
  const original = useCodeStore((s) => s.original);
  const openFile = useCodeStore((s) => s.openFile);
  const revertFile = useCodeStore((s) => s.revertFile);

  const changedPaths = useMemo(
    () =>
      getAllFiles()
        .map((file) => file.path)
        .filter(
          (path) =>
            buffers[path] !== saved[path] || saved[path] !== original[path]
        ),
    [buffers, saved, original]
  );

  return (
    <div className="code-sidebar-body">
      <p className="code-sidebar-heading">Source Control</p>
      {changedPaths.length === 0 ? (
        <p className="code-sidebar-empty">
          No changes. Edit a file and save it, then it shows up here.
        </p>
      ) : (
        <div className="code-tree">
          {changedPaths.map((path) => {
            const file = getFile(path);
            if (!file) return null;
            return (
              <div key={path} className="code-scm-row">
                <button
                  className="code-tree-row code-scm-file"
                  onClick={() => openFile(path)}
                >
                  <FileIcon language={file.language} />
                  <span className="code-tree-label">{file.name}</span>
                </button>
                <span className="code-scm-badge" aria-label="modified">
                  M
                </span>
                <button
                  className="code-scm-discard"
                  onClick={() => revertFile(path)}
                  title="Discard changes"
                  aria-label={`Discard changes in ${file.name}`}
                >
                  <Undo2 size={12} aria-hidden />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Main app ── */

export function CodeApp() {
  const openTabs = useCodeStore((s) => s.openTabs);
  const activePath = useCodeStore((s) => s.activePath);
  const buffers = useCodeStore((s) => s.buffers);
  const sidebarView = useCodeStore((s) => s.sidebarView);
  const sidebarVisible = useCodeStore((s) => s.sidebarVisible);
  const panelVisible = useCodeStore((s) => s.panelVisible);
  const changeCount = useCodeStore(
    (s) =>
      getAllFiles().filter(
        (file) => isModified(s, file.path) || isDirty(s, file.path)
      ).length
  );
  const activeDirty = useCodeStore((s) =>
    s.activePath ? isDirty(s, s.activePath) : false
  );
  const dirtyByTab = useCodeStore((s) =>
    s.openTabs.map((tab) => isDirty(s, tab)).join(",")
  );

  const setActivePath = useCodeStore((s) => s.setActivePath);
  const closeTab = useCodeStore((s) => s.closeTab);
  const editFile = useCodeStore((s) => s.editFile);
  const saveFile = useCodeStore((s) => s.saveFile);
  const selectSidebarView = useCodeStore((s) => s.selectSidebarView);
  const toggleSidebar = useCodeStore((s) => s.toggleSidebar);
  const togglePanel = useCodeStore((s) => s.togglePanel);

  const theme = useWindowStore((s) => s.theme);
  const toggleTheme = useWindowStore((s) => s.toggleTheme);

  const [cursor, setCursor] = useState<CursorPosition>({ line: 1, col: 1 });

  const activeFile = activePath ? getFile(activePath) : undefined;
  const dirtyFlags = dirtyByTab.split(",");

  const handleShortcuts = useCallback(
    (event: React.KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      const key = event.key.toLowerCase();
      if (key === "b") {
        event.preventDefault();
        toggleSidebar();
      } else if (key === "j" || event.key === "`") {
        event.preventDefault();
        togglePanel();
      } else if (key === "s") {
        // Swallow saves that bubble past the editor so the browser
        // save dialog never appears while the IDE has focus
        event.preventDefault();
        if (activePath) saveFile(activePath);
      }
    },
    [toggleSidebar, togglePanel, saveFile, activePath]
  );

  const activityItems: {
    view: SidebarView;
    label: string;
    Icon: typeof Files;
    badge?: number;
  }[] = [
    { view: "explorer", label: "Explorer", Icon: Files },
    { view: "search", label: "Search", Icon: Search },
    { view: "scm", label: "Source Control", Icon: GitBranch, badge: changeCount },
  ];

  return (
    <div className="code-app" onKeyDown={handleShortcuts}>
      <div className="code-main">
        <div className="code-activity" role="toolbar" aria-label="Activity Bar">
          {activityItems.map(({ view, label, Icon, badge }) => (
            <button
              key={view}
              className={`code-activity-btn ${
                sidebarVisible && sidebarView === view
                  ? "code-activity-btn-active"
                  : ""
              }`}
              onClick={() => selectSidebarView(view)}
              title={label}
              aria-label={label}
            >
              <Icon size={20} aria-hidden />
              {badge ? <span className="code-activity-badge">{badge}</span> : null}
            </button>
          ))}
          <button
            className={`code-activity-btn ${
              panelVisible ? "code-activity-btn-active" : ""
            }`}
            onClick={togglePanel}
            title="Terminal (⌘J)"
            aria-label="Toggle Terminal"
          >
            <SquareTerminal size={20} aria-hidden />
          </button>
          <div className="code-activity-spacer" />
          <button
            className="code-activity-btn"
            onClick={toggleTheme}
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun size={20} aria-hidden />
            ) : (
              <Moon size={20} aria-hidden />
            )}
          </button>
        </div>

        {sidebarVisible && (
          <div className="code-sidebar">
            {sidebarView === "explorer" && <ExplorerView />}
            {sidebarView === "search" && <SearchView />}
            {sidebarView === "scm" && <SourceControlView />}
          </div>
        )}

        <div className="code-editor-col">
          {openTabs.length > 0 && (
            <div className="code-tabs" role="tablist">
              {openTabs.map((tab, index) => {
                const file = getFile(tab);
                if (!file) return null;
                const dirty = dirtyFlags[index] === "true";
                return (
                  <div
                    key={tab}
                    className={`code-tab ${
                      activePath === tab ? "code-tab-active" : ""
                    }`}
                    role="tab"
                    aria-selected={activePath === tab}
                  >
                    <button
                      className="code-tab-open"
                      onClick={() => setActivePath(tab)}
                    >
                      <FileIcon language={file.language} />
                      <span>{file.name}</span>
                    </button>
                    <button
                      className={`code-tab-close ${
                        dirty ? "code-tab-close-dirty" : ""
                      }`}
                      onClick={() => closeTab(tab)}
                      aria-label={`Close ${file.name}`}
                    >
                      <span className="code-tab-dot" aria-hidden />
                      <X size={13} className="code-tab-x" aria-hidden />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {activeFile ? (
            <>
              <div className="code-breadcrumbs" aria-label="Breadcrumbs">
                <span>{PROJECT_NAME}</span>
                {activeFile.path.split("/").map((segment, i, parts) => (
                  <span key={i} className="code-breadcrumb-seg">
                    <ChevronRight size={11} aria-hidden />
                    {i === parts.length - 1 ? (
                      <span className="code-breadcrumb-file">
                        <FileIcon language={activeFile.language} />
                        {segment}
                      </span>
                    ) : (
                      segment
                    )}
                  </span>
                ))}
              </div>
              <Editor
                key={activeFile.path}
                path={activeFile.path}
                language={activeFile.language}
                value={buffers[activeFile.path] ?? activeFile.content}
                onChange={(content) => editFile(activeFile.path, content)}
                onSave={() => saveFile(activeFile.path)}
                onCursorChange={setCursor}
              />
            </>
          ) : (
            <div className="code-empty">
              <p className="code-empty-logo">bh code</p>
              <dl className="code-empty-hints">
                <dt>Open a file</dt>
                <dd>Explorer sidebar</dd>
                <dt>Save</dt>
                <dd>⌘S</dd>
                <dt>Toggle sidebar</dt>
                <dd>⌘B</dd>
                <dt>Toggle terminal</dt>
                <dd>⌘J</dd>
              </dl>
            </div>
          )}

          <div style={{ display: panelVisible ? undefined : "none" }}>
            <CodeTerminal />
          </div>
        </div>
      </div>

      <div className="code-status" role="status">
        <span className="code-status-item">
          <GitBranch size={11} aria-hidden /> main
        </span>
        <span className="code-status-item">
          <RefreshCw size={11} aria-hidden /> 0↓ {changeCount}↑
        </span>
        <span className="code-status-spacer" />
        {activeFile && (
          <>
            <span className="code-status-item">
              Ln {cursor.line}, Col {cursor.col}
            </span>
            <span className="code-status-item">Spaces: 2</span>
            <span className="code-status-item">UTF-8</span>
            <span className="code-status-item">
              {LANGUAGE_LABELS[activeFile.language]}
              {activeDirty ? " ●" : ""}
            </span>
          </>
        )}
        <span className="code-status-item">
          <Bell size={11} aria-hidden />
        </span>
      </div>
    </div>
  );
}
