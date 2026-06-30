export const profile = {
  name: "Yasir Khalid",
  role: "Data & Agentic AI Systems",
  location: "London, United Kingdom",
  email: "yasir_khalid@outlook.com",
  phone: "+44 75777 98274",
  linkedin: "https://www.linkedin.com/in/yasir-khalid",
  github: "https://github.com/yasir-khalid",
  x: "https://x.com/yasirrkhalid",
  site: "https://yasir-khalid.github.io/",
  current: "Lead Developer, HSBC",
  headline: "I build things end to end - and ship them.",
  sub: "Lead developer at HSBC shipping agentic AI. Founder of Sportscanner, built solo from frustration to 800+ players. Now building Traceyard for agent observability. I take ideas all the way - data pipeline, backend, UI, release, support.",
};

export const announcement = {
  text: "Spoke at Claude Code Central London - Eval pipelines for MCP-connected agents.",
  href: "https://www.linkedin.com/in/yasir-khalid",
};

export const trustMarks = [
  "HSBC",
  "KPMG",
  "Quantexa",
  "NatWest",
  "Ipsos",
];

// High-level positioning - who I am at a glance
export const pillars = [
  {
    label: "01",
    title: "End-to-end builder",
    body: "I take ideas to production and own the whole loop - research, design, engineering, release, and support.",
  },
  {
    label: "02",
    title: "Agentic AI in production",
    body: "Evals, tracing, guardrails, and MCP - the unglamorous parts that decide whether agents actually work.",
  },
  {
    label: "03",
    title: "Data, raw to useful",
    body: "I take messy data, shape it, and ship it as something people use - like Sportscanner, built solo.",
  },
  {
    label: "04",
    title: "Product & people",
    body: "I obsess over what the customer wants, share what I learn, and speak at community events on agents.",
  },
];

// Deeper technical proof - the agentic AI band
export const capabilities = [
  {
    label: "MCP integrations",
    body: "Wiring agents to enterprise tools via Model Context Protocol - including Quantexa's MCP gateway for tool calling.",
  },
  {
    label: "Evaluation pipelines",
    body: "LLM-as-judge evals on every PR - scoring correctness, efficiency, gap handling, and completeness.",
  },
  {
    label: "LLMOps & observability",
    body: "Custom OpenTelemetry tracing across multi-agent systems for granular, agent-level decision visibility.",
  },
  {
    label: "Guardrails & CI/CD",
    body: "Hallucination guardrails and the scaffolding that keeps non-deterministic systems honest and safe to ship.",
  },
];

export type Job = {
  company: string;
  role: string;
  location: string;
  period: string;
  points: string[];
  tags: string[];
};

export const experience: Job[] = [
  {
    company: "HSBC",
    role: "Lead Developer / Manager",
    location: "London",
    period: "2025 - Present",
    points: [
      "Lead the design and delivery of agentic AI on Google ADK, integrated to Quantexa's MCP gateway for tool calling.",
      "Own the full LLMOps lifecycle - prompt engineering, OpenTelemetry tracing, and LLM-as-judge evals on every PR.",
      "Migrated 3,000+ users to Kubernetes-native infra for a 50% performance gain; lifted team velocity 30% with FastAPI tooling.",
    ],
    tags: ["Google ADK", "MCP", "Vertex AI", "OpenTelemetry", "Kubernetes"],
  },
  {
    company: "Sportscanner",
    role: "Founder / Engineer",
    location: "London",
    period: "2025 - Present",
    points: [
      "Built solo from my own frustration finding courts - now 800+ players across 100+ venues, zero paid marketing.",
      "Own the whole stack: Python scrapers → data pipeline → FastAPI → Next.js UI → support.",
      "Now exploring BI insights for club owners, operators, and investors.",
    ],
    tags: ["FastAPI", "PostgreSQL", "Next.js", "Playwright", "Vercel"],
  },
  {
    company: "KPMG UK",
    role: "Assistant Manager / Senior Data Engineer",
    location: "London",
    period: "2022 - 2025",
    points: [
      "Delivered a terabyte-scale transaction-monitoring system for NatWest (Scala, Spark, Elasticsearch, Airflow).",
      "Owned delivery for Quantexa trade-finance use cases; shipped end-to-end RAG prototypes for policy comparison.",
      "Ran technical workshops for a 200+ member internal Python community.",
    ],
    tags: ["Apache Spark", "Scala", "Neo4j", "Quantexa", "LangGraph"],
  },
  {
    company: "Afterschool",
    role: "Co-Founder",
    location: "Remote",
    period: "2020 - 2022",
    points: [
      "Co-founded an e-learning platform; led the investment pitch in Y Combinator's final round (W21).",
      "Owned customer analytics and user-journey tracking across GA, GTM, Hotjar, and Microsoft Clarity.",
    ],
    tags: ["Y Combinator", "Analytics", "Growth"],
  },
  {
    company: "Ipsos UK",
    role: "Data Scientist - Audience Measurement",
    location: "London",
    period: "2022",
    points: [
      "Analysed multi-timezone traffic data to surface activity spikes; automated Looker Studio reporting in SQL.",
      "Led migrations to scalable, config-driven designs.",
    ],
    tags: ["SQL", "Looker Studio", "Python"],
  },
  {
    company: "Spotlight Data",
    role: "Data Scientist",
    location: "Nottingham",
    period: "2021",
    points: [
      "Built continuous data monitoring and an adverse-media forecasting PoC (Prophet) with sentiment analysis.",
      "Surfaced findings to stakeholders through Tableau dashboards.",
    ],
    tags: ["Python", "Prophet", "Tableau"],
  },
];

export type Project = {
  name: string;
  href?: string;
  badge?: string;
  blurb: string;
  points: string[];
  stack: string[];
};

export const projects: Project[] = [
  {
    name: "Sportscanner",
    href: "https://www.sportscanner.co.uk",
    badge: "Live · 800+ players",
    blurb: "A marketplace for sports-court bookings in London - built solo.",
    points: [
      "Compare badminton, squash & pickleball courts across 100+ venues in seconds.",
      "Raw data to useful product: scrapers crawl 10,000+ URLs → cleaned → served fast.",
      "Full ownership of the loop, from data engineering to UI to user support.",
    ],
    stack: [
      "Python (Playwright, httpx)",
      "FastAPI",
      "PostgreSQL",
      "Next.js",
      "Vercel",
    ],
  },
  {
    name: "Traceyard",
    badge: "Building",
    blurb: "An evals and observability framework for multi-agent systems.",
    points: [
      "Maps agent semantics - runs, steps, tool calls, sub-agent handoffs - into one unified trace layer.",
      "Framework-agnostic: works across Google ADK, LangGraph, and custom pipelines.",
      "No vendor-specific instrumentation shims required.",
    ],
    stack: ["OpenTelemetry", "Google ADK", "LangGraph", "Tracing"],
  },
  {
    name: "Simulation Lab",
    href: "/lab",
    badge: "Open",
    blurb: "Interactive system design explainers - every chapter of Alex Xu's books, playable in the browser.",
    points: [
      "25+ hands-on simulations: rate limiters, consistent hashing, hot keys, nearby friends.",
      "Each lab is a self-contained React component - no backend, runs entirely client-side.",
      "Full Vol.1 coverage plus advanced designs from Vol.2.",
    ],
    stack: ["Next.js 15", "React 19", "TypeScript", "Tailwind v4"],
  },
];

export const metrics = [
  { value: "15,000+", label: "users on the agentic platform" },
  { value: "800+", label: "players on Sportscanner" },
  { value: "30 TB", label: "data processed for NatWest" },
  { value: "100+", label: "venues, crawled & cleaned" },
];

export const speaking = {
  venue: "Claude Code Central London",
  title: "Eval pipelines for MCP-connected agents",
  when: "Community talk",
};

export const skills: { group: string; items: string[] }[] = [
  {
    group: "AI / LLM",
    items: [
      "Google ADK",
      "Model Context Protocol",
      "LangChain / LangGraph",
      "LLM-as-judge evals",
      "Guardrails",
      "LLMOps",
      "Vertex AI",
      "Gemini",
      "OpenAI APIs",
      "OpenTelemetry",
    ],
  },
  {
    group: "Backend",
    items: ["Python", "FastAPI", "PostgreSQL", "Docker", "Kubernetes", "Helm"],
  },
  {
    group: "Data",
    items: [
      "Apache Spark",
      "Airflow",
      "Elasticsearch",
      "Pinecone",
      "Neo4j",
      "Quantexa",
      "Scala",
    ],
  },
  {
    group: "Cloud / CI",
    items: ["AWS", "Azure", "GitHub Actions", "GitLab CI", "Databricks"],
  },
];

export const certifications = [
  "Agent Observability & Evaluations",
  "Model Context Protocol",
  "Core Consulting Training",
  "GitHub Actions",
  "Neural Networks & Deep Learning",
];

export const languages = [
  { name: "English", level: "Native / Bilingual" },
  { name: "Urdu", level: "Native / Bilingual" },
  { name: "Hindi", level: "Native / Bilingual" },
  { name: "Punjabi", level: "Working" },
];

export const education = [
  {
    school: "University of Nottingham",
    degree: "MSc Information Systems & Operations",
    result: "Distinction",
    period: "2020 - 2021",
  },
  {
    school: "National University of Sciences & Technology (NUST)",
    degree: "B.Eng. Mechatronics, Robotics & Automation",
    result: "",
    period: "2016 - 2020",
  },
];
