export const PROFILE = {
  name: "Brian Hsu",
  tagline:
    "Computer Science & Cognitive Science student at the University of Michigan.",
  intro:
    "I build high-performance systems — from HPC clusters and scientific computing platforms to data pipelines and ML research tooling — with an eye for how software supports real human and scientific workflows.",
  education: {
    degree: "B.S. Computer Science & B.S. Cognitive Science",
    detail: "Computation track · GPA 3.9/4.0",
    school: "University of Michigan, Ann Arbor",
  },
} as const;

export const FOCUS_AREAS = [
  { label: "HPC & Supercomputing", emoji: "🖥️" },
  { label: "Distributed Systems", emoji: "🔗" },
  { label: "Scientific Computing", emoji: "🔬" },
  { label: "Systems Programming", emoji: "⚡" },
  { label: "Machine Learning", emoji: "🧠" },
  { label: "Cognitive Science", emoji: "👁️" },
] as const;

export const EXPERIENCES = [
  {
    role: "Supercomputing Engineer",
    org: "Los Alamos National Laboratory",
    period: "May 2026 – Aug 2026",
    detail:
      "Building HPC clusters from scratch with Rocky Linux, iPXE, and SLURM — InfiniBand/Ethernet networking and benchmarking 400Gb/s+ data transfers.",
  },
  {
    role: "Scientific Computing Engineer",
    org: "Memorial Sloan Kettering Cancer Center",
    period: "Jun 2025 – Sep 2025",
    detail:
      "Shipped an Open OnDemand dashboard for MSK's HPC cluster, cutting new-user support tickets by 20%. Built real-time SLURM monitoring and automated usage reporting.",
  },
  {
    role: "Data Analytics Intern",
    org: "Lyft",
    period: "Jun 2024 – Aug 2024",
    detail:
      "Built SQL pipelines analyzing 44k+ users; proposed scoring changes that reduced operational costs by 7% and negative user costs by 12%.",
  },
] as const;

export const SKILLS = [
  "Python",
  "C/C++",
  "Linux",
  "AWS",
  "Docker",
  "SLURM",
  "React",
  "PyTorch",
] as const;
