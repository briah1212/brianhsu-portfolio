export type CodeLanguage =
  | "json"
  | "python"
  | "html"
  | "css"
  | "markdown"
  | "plain";

export interface CodeFile {
  type: "file";
  name: string;
  path: string;
  language: CodeLanguage;
  content: string;
}

export interface CodeFolder {
  type: "folder";
  name: string;
  path: string;
  children: CodeNode[];
}

export type CodeNode = CodeFile | CodeFolder;

export const PROJECT_NAME = "brian-hsu";

const README_MD = `# brian-hsu

Welcome to my corner of the machine.

This editor is real (well, mostly). Things you can actually do:

- Browse the tree on the left. Everything in here is true.
- Open a file, edit it, and hit Cmd+S / Ctrl+S to save.
- Pop open the terminal panel and type \`help\`.
- Search the whole project with the magnifying glass.

## Map

| Path                    | What it is                        |
| ----------------------- | --------------------------------- |
| \`about/brian.json\`      | Machine-readable me               |
| \`src/slurm_monitor.py\`  | HPC cluster monitoring, condensed |
| \`web/index.html\`        | v1 of this site, one file         |
| \`notes/ideas.md\`        | Things I might build next         |

No node_modules were harmed in the making of this repo.
`;

const BRIAN_JSON = `{
  "name": "Brian Hsu",
  "location": "Ann Arbor, MI",
  "education": {
    "school": "University of Michigan",
    "degrees": ["B.S. Computer Science", "B.S. Cognitive Science"],
    "track": "Computation",
    "gpa": 3.9
  },
  "focus": [
    "HPC & Supercomputing",
    "Distributed Systems",
    "Scientific Computing",
    "Systems Programming",
    "Machine Learning",
    "Cognitive Science"
  ],
  "experience": [
    {
      "role": "Supercomputing Engineer",
      "org": "Los Alamos National Laboratory",
      "year": 2026,
      "highlight": "Building HPC clusters from scratch: Rocky Linux, iPXE, SLURM, 400Gb/s+ interconnects"
    },
    {
      "role": "Scientific Computing Engineer",
      "org": "Memorial Sloan Kettering Cancer Center",
      "year": 2025,
      "highlight": "Open OnDemand dashboard for the HPC cluster, -20% new-user support tickets"
    },
    {
      "role": "Data Analytics Intern",
      "org": "Lyft",
      "year": 2024,
      "highlight": "SQL pipelines over 44k+ users, -7% operational costs"
    }
  ],
  "skills": ["Python", "C/C++", "Linux", "AWS", "Docker", "SLURM", "React", "PyTorch"],
  "openToInterestingProblems": true,
  "coffee": "yes, please"
}
`;

const SLURM_MONITOR_PY = `"""Poll a SLURM cluster and summarize node health.

Distilled from tooling I built for a real cluster.
Node names changed to protect the innocent.
"""

import subprocess
from collections import Counter
from dataclasses import dataclass

POLL_INTERVAL_S = 30
ALERT_THRESHOLD = 0.15  # fraction of nodes down before we page someone


@dataclass
class NodeState:
    name: str
    state: str
    load: float


def fetch_nodes() -> list[NodeState]:
    """Shell out to sinfo and parse per-node states."""
    out = subprocess.run(
        ["sinfo", "-N", "-h", "-o", "%N %T %O"],
        capture_output=True,
        text=True,
        check=True,
    ).stdout

    nodes = []
    for line in out.strip().splitlines():
        name, state, load = line.split()
        nodes.append(NodeState(name, state, float(load)))
    return nodes


def summarize(nodes: list[NodeState]) -> str:
    counts = Counter(node.state for node in nodes)
    down = counts.get("down", 0) + counts.get("drained", 0)

    summary = f"{len(nodes)} nodes | " + ", ".join(
        f"{state}: {count}" for state, count in counts.most_common()
    )
    if nodes and down / len(nodes) > ALERT_THRESHOLD:
        summary += "  <- page the on-call (me)"
    return summary


if __name__ == "__main__":
    print(summarize(fetch_nodes()))
`;

const INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Brian Hsu</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <!-- The first version of this site was one file. This file. -->
    <main class="hero">
      <h1>Hi, I'm Brian.</h1>
      <p>I build high-performance systems and the tools around them.</p>
      <a class="cta" href="mailto:brianhsu1212@gmail.com">Say hello</a>
    </main>
  </body>
</html>
`;

const STYLES_CSS = `/* v1 of the portfolio: forty lines of CSS and a dream */

:root {
  --ink: #1d1d1f;
  --paper: #f5f5f7;
  --sky: #38bdf8;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: var(--paper);
  color: var(--ink);
}

.hero {
  min-height: 100vh;
  display: grid;
  place-content: center;
  text-align: center;
  gap: 12px;
}

.hero h1 {
  font-size: 3rem;
  letter-spacing: -0.03em;
}

.cta {
  justify-self: center;
  padding: 10px 22px;
  border-radius: 999px;
  background: var(--sky);
  color: #fff;
  text-decoration: none;
}
`;

const IDEAS_MD = `# Ideas

Things I might build next, in no particular order.

- [x] Genie-style dock animation
- [x] A code editor app for the portfolio site <- you are here
- [ ] Cluster heatmap of live SLURM node states
- [ ] Teach the terminal more commands (it deserves it)
- [ ] InfiniBand vs Ethernet benchmark visualizer
- [ ] A tiny window manager written in Rust, for no reason

> Rule of thumb: if it teaches me something about systems,
> it goes on the list.
`;

const GITIGNORE = `# Dependencies
node_modules/
__pycache__/

# Build output
dist/
*.log

# OS noise
.DS_Store

# Secrets go in the other, more secret file
.env
`;

export const CODE_PROJECT: CodeFolder = {
  type: "folder",
  name: PROJECT_NAME,
  path: "",
  children: [
    {
      type: "folder",
      name: "about",
      path: "about",
      children: [
        {
          type: "file",
          name: "brian.json",
          path: "about/brian.json",
          language: "json",
          content: BRIAN_JSON,
        },
      ],
    },
    {
      type: "folder",
      name: "notes",
      path: "notes",
      children: [
        {
          type: "file",
          name: "ideas.md",
          path: "notes/ideas.md",
          language: "markdown",
          content: IDEAS_MD,
        },
      ],
    },
    {
      type: "folder",
      name: "src",
      path: "src",
      children: [
        {
          type: "file",
          name: "slurm_monitor.py",
          path: "src/slurm_monitor.py",
          language: "python",
          content: SLURM_MONITOR_PY,
        },
      ],
    },
    {
      type: "folder",
      name: "web",
      path: "web",
      children: [
        {
          type: "file",
          name: "index.html",
          path: "web/index.html",
          language: "html",
          content: INDEX_HTML,
        },
        {
          type: "file",
          name: "styles.css",
          path: "web/styles.css",
          language: "css",
          content: STYLES_CSS,
        },
      ],
    },
    {
      type: "file",
      name: ".gitignore",
      path: ".gitignore",
      language: "plain",
      content: GITIGNORE,
    },
    {
      type: "file",
      name: "README.md",
      path: "README.md",
      language: "markdown",
      content: README_MD,
    },
  ],
};

export function getAllFiles(node: CodeNode = CODE_PROJECT): CodeFile[] {
  if (node.type === "file") return [node];
  return node.children.flatMap((child) => getAllFiles(child));
}

export function getAllFolders(node: CodeNode = CODE_PROJECT): CodeFolder[] {
  if (node.type === "file") return [];
  const nested = node.children.flatMap((child) => getAllFolders(child));
  return node.path === "" ? nested : [node, ...nested];
}

export function getFile(path: string): CodeFile | undefined {
  return getAllFiles().find((file) => file.path === path);
}
