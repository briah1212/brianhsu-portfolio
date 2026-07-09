import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CodeApp } from "./CodeApp";
import { getInitialCodeState, useCodeStore } from "./codeStore";
import { getAllFiles } from "./codeFiles";
import { tokenize } from "./highlight";

describe("CodeApp", () => {
  beforeEach(() => {
    useCodeStore.setState(getInitialCodeState());
  });

  afterEach(() => {
    cleanup();
  });

  function getEditor(path: string): HTMLTextAreaElement {
    return screen.getByLabelText(`Editor: ${path}`) as HTMLTextAreaElement;
  }

  it("boots with the project explorer and README open in the editor", () => {
    render(<CodeApp />);

    expect(screen.getByText("BRIAN-HSU")).toBeInTheDocument();
    expect(screen.getByText("slurm_monitor.py")).toBeInTheDocument();
    expect(getEditor("README.md").value).toContain(
      "Welcome to my corner of the machine."
    );
  });

  it("opens a file from the explorer tree", () => {
    render(<CodeApp />);

    fireEvent.click(screen.getByText("slurm_monitor.py"));

    expect(getEditor("src/slurm_monitor.py").value).toContain(
      "Poll a SLURM cluster"
    );
    expect(
      screen.getByRole("tab", { selected: true })
    ).toHaveTextContent("slurm_monitor.py");
  });

  it("marks a tab dirty on edit and clean again after Cmd+S", () => {
    render(<CodeApp />);
    const editor = getEditor("README.md");
    const closeButton = screen.getByLabelText("Close README.md");

    fireEvent.change(editor, { target: { value: "# rewritten" } });
    expect(closeButton.className).toContain("code-tab-close-dirty");

    fireEvent.keyDown(editor, { key: "s", metaKey: true });
    expect(closeButton.className).not.toContain("code-tab-close-dirty");
  });

  it("closes tabs and shows the empty state when none remain", () => {
    render(<CodeApp />);

    fireEvent.click(screen.getByLabelText("Close brian.json"));
    fireEvent.click(screen.getByLabelText("Close README.md"));

    expect(screen.getByText("bh code")).toBeInTheDocument();
  });

  it("searches across files and opens the file at the hit", () => {
    render(<CodeApp />);

    fireEvent.click(screen.getByLabelText("Search"));
    fireEvent.change(screen.getByLabelText("Search files"), {
      target: { value: "sinfo" },
    });

    const hit = screen.getAllByTitle(/^src\/slurm_monitor\.py:\d+$/)[0];
    fireEvent.click(hit);

    expect(getEditor("src/slurm_monitor.py")).toBeInTheDocument();
  });

  it("lists saved changes in source control and discards them", () => {
    render(<CodeApp />);
    const editor = getEditor("README.md");
    const originalContent = editor.value;

    fireEvent.change(editor, { target: { value: "# rewritten" } });
    fireEvent.keyDown(editor, { key: "s", metaKey: true });
    fireEvent.click(screen.getByLabelText("Source Control"));

    expect(screen.getByLabelText("modified")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Discard changes in README.md"));

    expect(getEditor("README.md").value).toBe(originalContent);
    expect(
      screen.getByText(/No changes\. Edit a file and save it/)
    ).toBeInTheDocument();
  });

  it("runs terminal commands against the virtual project", () => {
    render(<CodeApp />);

    fireEvent.click(screen.getByLabelText("Toggle Terminal"));
    const input = screen.getByLabelText("Terminal input");

    fireEvent.change(input, { target: { value: "ls" } });
    fireEvent.submit(input.closest("form")!);
    expect(screen.getByText(/about\/\s+notes\/\s+src\/\s+web\//)).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "open web/index.html" } });
    fireEvent.submit(input.closest("form")!);
    expect(getEditor("web/index.html").value).toContain("Hi, I'm Brian.");
  });
});

describe("tokenize", () => {
  it("is lossless for every bundled file", () => {
    for (const file of getAllFiles()) {
      const tokens = tokenize(file.content, file.language);
      expect(tokens.map((token) => token.text).join("")).toBe(file.content);
    }
  });

  it("classifies python keywords, functions, strings, and comments", () => {
    const tokens = tokenize(
      'def greet():\n    return "hi"  # comment',
      "python"
    );
    expect(tokens).toContainEqual({ type: "keyword", text: "def" });
    expect(tokens).toContainEqual({ type: "function", text: "greet" });
    expect(tokens).toContainEqual({ type: "string", text: '"hi"' });
    expect(tokens).toContainEqual({ type: "comment", text: "# comment" });
  });

  it("distinguishes json keys from string values", () => {
    const tokens = tokenize('{ "a": "b", "n": 3, "ok": true }', "json");
    expect(tokens).toContainEqual({ type: "property", text: '"a"' });
    expect(tokens).toContainEqual({ type: "string", text: '"b"' });
    expect(tokens).toContainEqual({ type: "number", text: "3" });
    expect(tokens).toContainEqual({ type: "boolean", text: "true" });
  });

  it("treats css pseudo-class selectors as selectors, not properties", () => {
    const tokens = tokenize("a:hover { color: red; }", "css");
    expect(tokens).toContainEqual({ type: "tag", text: "a" });
    expect(tokens).toContainEqual({ type: "property", text: "color" });
  });
});
