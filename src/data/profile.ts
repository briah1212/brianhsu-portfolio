// Single source of truth for Brian's profile. Home, About, the terminal,
// the code viewer, and the chatbot prompt all read from here, so a fact
// changed here changes everywhere. Keep every claim verifiable.

export const PROFILE = {
  name: "Brian Hsu",
  tagline:
    "Computer Science & Cognitive Science graduate of the University of Michigan.",
  intro:
    "I build high-performance systems — from HPC clusters and scientific computing platforms to data pipelines and ML research tooling — with an eye for how software supports real human and scientific workflows.",
  location: "New York, NY",
  education: {
    degree: "B.S. Computer Science & Cognitive Science (double major)",
    detail: "Computation and Cognition track · GPA 3.85/4.0",
    school: "University of Michigan, Ann Arbor",
  },
} as const;

export const CONTACT = {
  email: "hsubrian1212@gmail.com",
  linkedin: "brianhsuu",
  github: "briah1212",
  resume: "/Resume.pdf",
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
    role: "High Performance Computing Fellow",
    org: "Los Alamos National Laboratory",
    period: "May 2026 – Aug 2026",
    detail:
      "Built an HPC cluster from scratch with Rocky Linux, iPXE, and SLURM: InfiniBand and Ethernet networking, automated node provisioning, and benchmarking of 400 Gb/s NVIDIA Skyway gateways.",
  },
  {
    role: "Scientific Computing Engineer Intern",
    org: "Memorial Sloan Kettering Cancer Center",
    period: "Jun 2025 – Sep 2025",
    detail:
      "Shipped a new Open OnDemand dashboard (Ruby on Rails) for MSK's HPC cluster, cutting new-user support tickets by 16%. Built SLURM utilization charts with Pandas and Chart.js, and automated usage reporting with Python, Bash, and Ansible while onboarding 3 new labs.",
  },
  {
    role: "Data & Community Intern",
    org: "Lyft",
    period: "Jun 2024 – Aug 2024",
    detail:
      "Mapped demographic and transportation characteristics across NYC neighborhoods to assess bike-share expansion, and wrote Python scrapers combining census, transit, and field-collected community data into location-specific outreach recommendations.",
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
