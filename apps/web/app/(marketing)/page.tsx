"use client";

import { motion } from "framer-motion";
import {
  CircuitBoard,
  ShieldCheck,
  Zap,
  Library,
  ArrowRight,
  Brain,
  ExternalLink,
  Building2,
  Target,
  GraduationCap,
  Cpu,
  Map,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BrandLogo } from "@/components/BrandLogo";

// ─── Animation helpers ────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

// ─── Grid background ─────────────────────────────────────────────────────────

function GridBg({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)",
        backgroundSize: "40px 40px",
      }}
    />
  );
}

// ─── Nav ─────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-cx-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <BrandLogo href="/" size="sm" />
        </div>
        <div className="hidden items-center gap-6 md:flex">
          <a
            href="#features"
            className="font-mono text-xs text-cx-muted transition-colors hover:text-cyan-400"
          >
            features
          </a>
          <a
            href="#preview"
            className="font-mono text-xs text-cx-muted transition-colors hover:text-cyan-400"
          >
            preview
          </a>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/auth"
            className="font-mono text-xs text-cx-muted transition-colors hover:text-foreground/80"
          >
            sign in
          </Link>
          <Link
            href="/auth"
            className="flex items-center gap-1.5 rounded border border-cyan-500 bg-cyan-500/10 px-3 py-1.5 font-mono text-xs text-cyan-300 transition-all hover:bg-cyan-500/20"
          >
            get started <ArrowRight size={10} />
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ─── Mock Architecture Map ────────────────────────────────────────────────────

function MockArchMap() {
  const nodes = [
    { id: "api", label: "api/ingest", x: "12%", y: "15%", color: "#22d3ee" },
    { id: "hook", label: "useIngestor", x: "62%", y: "10%", color: "#a78bfa" },
    {
      id: "comp",
      label: "FolderIngestor",
      x: "38%",
      y: "45%",
      color: "#4ade80",
    },
    { id: "groq", label: "lib/groq", x: "8%", y: "72%", color: "#fb923c" },
    { id: "db", label: "schema.prisma", x: "68%", y: "70%", color: "#f472b6" },
  ];

  const edges = [
    ["12%", "15%", "38%", "45%"],
    ["62%", "10%", "38%", "45%"],
    ["38%", "45%", "8%", "72%"],
    ["38%", "45%", "68%", "70%"],
  ];

  return (
    <div className="relative h-44 w-full overflow-hidden rounded border border-cx-border bg-cx-surface">
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {edges.map(([x1, y1, x2, y2], i) => (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#22d3ee"
            strokeWidth="1"
            strokeOpacity="0.25"
            strokeDasharray="4 4"
          />
        ))}
      </svg>
      {nodes.map((n) => (
        <div
          key={n.id}
          className="absolute flex items-center gap-1.5 rounded border bg-background/80 px-2 py-1 backdrop-blur-sm"
          style={{
            left: n.x,
            top: n.y,
            borderColor: n.color + "50",
            transform: "translate(-50%,-50%)",
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: n.color }}
          />
          <span className="font-mono text-[9px] text-cx-muted">{n.label}</span>
        </div>
      ))}
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-background pt-20">
      <GridBg />
      <div className="absolute left-1/3 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/5 blur-3xl" />
      <div className="absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full bg-purple-500/5 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6 py-24">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid items-center gap-16 lg:grid-cols-2"
        >
          {/* Left — copy */}
          <div>
            <motion.div variants={fadeUp}>
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-800/50 bg-cyan-950/30 px-3 py-1 font-mono text-[10px] text-cyan-400">
                <Cpu size={10} /> architectural intelligence system
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="mb-5 font-sans text-4xl font-bold leading-tight tracking-tight text-foreground lg:text-5xl"
            >
              Codebases are complex.{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Understanding them shouldn&apos;t be.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mb-8 font-mono text-sm leading-7 text-cx-muted"
            >
              CortexPath is your architectural intelligence system. Mirror your
              local code to the cloud, generate AI logic summaries, and audit
              your system design in real-time.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <Link
                href="/auth"
                className="flex items-center gap-2 rounded bg-cyan-500 px-5 py-2.5 font-mono text-sm font-medium text-zinc-950 transition-all hover:bg-cyan-400 hover:shadow-[0_0_24px_rgba(34,211,238,0.35)]"
              >
                Get Started <ArrowRight size={14} />
              </Link>
              <a
                href="#mobile"
                className="flex items-center gap-2 rounded border border-cx-border px-5 py-2.5 font-mono text-sm text-cx-muted transition-all hover:border-cx-border/60 hover:text-foreground"
              >
                <Smartphone size={14} /> Download Mobile App
              </a>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-8 flex items-center gap-6"
            >
              {[
                { value: "AST", label: "Import Analysis" },
                { value: "Llama 3.3", label: "70B Model" },
                { value: "pgvector", label: "Vector Search" },
              ].map((stat) => (
                <div key={stat.value} className="text-center">
                  <p className="font-mono text-sm font-semibold text-cyan-400">
                    {stat.value}
                  </p>
                  <p className="font-mono text-[10px] text-cx-muted/70">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — mock map card */}
          <motion.div variants={fadeUp}>
            <div className="rounded-xl border border-cx-border bg-cx-surface p-4 backdrop-blur-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Map size={12} className="text-cyan-400" />
                  <span className="font-mono text-[10px] text-cx-muted">
                    cortex://architecture-map
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {["bg-red-500", "bg-yellow-500", "bg-green-500"].map((c) => (
                    <span
                      key={c}
                      className={`h-2 w-2 rounded-full ${c} opacity-60`}
                    />
                  ))}
                </div>
              </div>
              <MockArchMap />
              <div className="mt-3 flex items-center justify-between">
                <span className="font-mono text-[10px] text-cx-muted/70">
                  5 nodes · 4 edges
                </span>
                <span className="font-mono text-[10px] text-green-400">
                  ● live sync
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Pillars ──────────────────────────────────────────────────────────────────

const PILLARS = [
  {
    icon: CircuitBoard,
    color: "text-cyan-400",
    border: "border-cyan-800/40",
    glow: "hover:shadow-[0_0_24px_rgba(34,211,238,0.08)]",
    title: "The Ingester",
    badge: "AST + Cloud Mirror",
    desc: "Deep AST parsing of local TS/JS. Map your dependencies and mirror your logic to a secure Neon Cloud with pgvector embeddings.",
  },
  {
    icon: Brain,
    color: "text-purple-400",
    border: "border-purple-800/40",
    glow: "hover:shadow-[0_0_24px_rgba(168,85,247,0.08)]",
    title: "The Interpreter",
    badge: "Llama 3.3 70B",
    desc: 'Powered by Llama 3.3 70B via Groq. Get plain-English logic summaries that explain the "Why" behind the "What" for every file.',
  },
  {
    icon: ShieldCheck,
    color: "text-green-400",
    border: "border-green-800/40",
    glow: "hover:shadow-[0_0_24px_rgba(74,222,128,0.08)]",
    title: "The Auditor",
    badge: "Security + FinOps",
    desc: "Proactive security, performance, and sustainability checks. Know your Blast Radius before you refactor.",
  },
];

function PillarsSection() {
  return (
    <section id="features" className="relative bg-background py-24">
      <GridBg className="opacity-50" />
      <div className="relative mx-auto max-w-6xl px-6">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-cyan-700">
            core capabilities
          </p>
          <h2 className="font-sans text-3xl font-bold text-foreground">
            Three pillars. One system.
          </h2>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-3"
        >
          {PILLARS.map(
            ({ icon: Icon, color, border, glow, title, badge, desc }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className={`group rounded-xl border ${border} bg-cx-surface p-6 backdrop-blur-sm transition-all ${glow}`}
              >
                <div
                  className={`mb-4 flex w-fit rounded-lg border ${border} bg-cx-surface p-2.5`}
                >
                  <Icon size={18} className={color} />
                </div>
                <span
                  className={`mb-2 block font-mono text-[10px] uppercase tracking-widest ${color}`}
                >
                  {badge}
                </span>
                <h3 className="mb-2 font-sans text-lg font-semibold text-foreground">
                  {title}
                </h3>
                <p className="font-mono text-xs leading-6 text-cx-muted">
                  {desc}
                </p>
              </motion.div>
            ),
          )}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Mentor Moment Preview ────────────────────────────────────────────────────

const SAMPLE_CODE = `// hooks/useIngestor.ts
export function useIngestor() {
  const [status, setStatus] =
    useState<IngestStatus>('idle');
  const [progress, setProgress] =
    useState({ current: 0, total: 0 });
  const contentCache =
    useRef<Map<string, string>>(new Map());

  // Restore previous session from DB on mount
  useEffect(() => {
    fetch('/api/files')
      .then(r => r.json())
      .then(({ files }) => {
        if (files?.length) {
          setResults(files);
          setStatus('done');
        }
      });
  }, []);

  const selectFolder = useCallback(async () => {
    const dir = await showDirectoryPicker();
    const files: FileEntry[] = [];
    await collectFiles(dir, '', files);

    for (const batch of chunk(files, 10)) {
      await fetch('/api/ingest/batch', {
        method: 'POST',
        body: JSON.stringify({ files: batch }),
      });
    }
    setStatus('done');
  }, []);
}`;

const AUDIT_ITEMS = [
  {
    Icon: Building2,
    color: "text-cyan-400",
    label: "1. architectural blueprint",
    text: "State Orchestration Layer · bridges File System Access API → Groq batch summarization → Neon DB · Complexity 7/10",
  },
  {
    Icon: Brain,
    color: "text-purple-400",
    label: "2. logical narrative",
    text: "Owns the full ingestion lifecycle: collectFiles → chunk(10) → POST /api/ingest/batch loop, caching raw content in a useRef Map for on-click interpret calls.",
  },
  {
    Icon: ShieldCheck,
    color: "text-green-400",
    label: "3. security & resilience",
    text: "No rate-limit on batch POSTs — a 10 000-file repo fires hundreds of unthrottled requests. Fix: wrap the batch loop with p-limit(3).",
  },
  {
    Icon: Zap,
    color: "text-yellow-400",
    label: "4. optimization",
    text: "Sequential batch loop: 100 batches × 2 s = 200 s worst case. Promise.all with a concurrency cap yields 3× throughput.",
  },
  {
    Icon: Target,
    color: "text-red-400",
    label: "6. blast radius",
    text: "Fragility 8/10 · FolderIngestor, page.tsx, and all /api/ingest/* routes depend on this hook's status shape — a FileResult rename breaks 4 files.",
  },
  {
    Icon: GraduationCap,
    color: "text-teal-400",
    label: "8. mentor challenge",
    text: 'Level: Applying → refactor selectFolder\'s implicit state machine into useReducer — eliminate the impossible state where status="done" but results=[].',
  },
];

function MentorMomentSection() {
  return (
    <section
      id="preview"
      className="relative overflow-hidden bg-background py-24"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background via-foreground/5 to-background" />
      <div className="relative mx-auto max-w-6xl px-6">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mb-14"
        >
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-cyan-700">
            interactive preview
          </p>
          <h2 className="font-sans text-3xl font-bold text-foreground">
            The Mentor Moment.
          </h2>
          <p className="mt-2 font-mono text-sm text-cx-muted">
            Ingest your entire codebase once — then click any file in the tree
            to stream a structured AI audit rooted in real imports, exports, and
            dependency context.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 lg:grid-cols-2"
        >
          {/* Code pane */}
          <motion.div variants={fadeUp}>
            <div className="rounded-xl border border-cx-border bg-cx-surface overflow-hidden">
              <div className="flex items-center gap-2 border-b border-cx-border px-4 py-2.5">
                <span className="font-mono text-[10px] text-cx-muted/70">
                  hooks/useDebounce.ts
                </span>
                <span className="ml-auto rounded bg-cyan-950/50 px-1.5 py-0.5 font-mono text-[9px] text-cyan-400">
                  LIVE
                </span>
              </div>
              <pre className="overflow-x-auto p-5 font-mono text-xs leading-6 text-foreground/80">
                <code>{SAMPLE_CODE}</code>
              </pre>
            </div>
          </motion.div>

          {/* Audit pane */}
          <motion.div variants={fadeUp}>
            <div className="rounded-xl border border-cx-border bg-cx-surface overflow-hidden">
              <div className="flex items-center gap-2 border-b border-cx-border px-4 py-2.5">
                <Cpu size={11} className="text-cyan-400" />
                <span className="font-mono text-[10px] text-cx-muted">
                  cortex audit
                </span>
                <span className="ml-auto font-mono text-[9px] text-green-400">
                  ● complete
                </span>
              </div>
              <div className="space-y-4 p-5">
                {AUDIT_ITEMS.map(({ Icon, color, label, text }) => (
                  <div key={label} className="flex gap-3">
                    <Icon size={12} className={`mt-0.5 shrink-0 ${color}`} />
                    <div>
                      <p
                        className={`mb-0.5 font-mono text-[9px] uppercase tracking-widest ${color}`}
                      >
                        {label}
                      </p>
                      <p className="font-mono text-xs leading-5 text-cx-muted">
                        {text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Mobile Librarian ─────────────────────────────────────────────────────────

function MobileSection() {
  return (
    <section id="mobile" className="relative bg-background py-24">
      <GridBg className="opacity-30" />
      <div className="relative mx-auto max-w-6xl px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid items-center gap-14 lg:grid-cols-2"
        >
          {/* Phone mockup */}
          <motion.div variants={fadeUp} className="flex justify-center">
            <div className="relative h-[420px] w-[210px] rounded-[2.2rem] border-[6px] border-cx-border bg-background shadow-2xl">
              <div className="absolute inset-x-0 top-3 flex justify-center">
                <div className="h-1.5 w-16 rounded-full bg-cx-border" />
              </div>
              <div className="mt-6 space-y-3 p-4">
                <p className="font-mono text-[9px] uppercase tracking-widest text-cyan-700">
                  blast radius
                </p>
                {[
                  "api/route.ts",
                  "hooks/useIngestor",
                  "components/FilePanel",
                ].map((f, i) => (
                  <div
                    key={f}
                    className="flex items-center gap-2 rounded border border-cx-border bg-cx-surface px-2.5 py-1.5"
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${i === 0 ? "bg-red-400" : "bg-cx-muted/40"}`}
                    />
                    <span className="font-mono text-[9px] text-cx-muted">
                      {f}
                    </span>
                  </div>
                ))}
                <div className="mt-4 rounded border border-purple-800/40 bg-purple-950/20 p-3">
                  <p className="font-mono text-[9px] text-purple-400 uppercase tracking-widest mb-1">
                    mentor challenge
                  </p>
                  <p className="font-mono text-[9px] text-cx-muted leading-4">
                    Add error boundaries at integration points...
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Copy */}
          <motion.div variants={fadeUp}>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-cyan-700">
              mobile librarian
            </p>
            <h2 className="mb-4 font-sans text-3xl font-bold text-foreground">
              Architecture in your pocket.
            </h2>
            <p className="mb-6 font-mono text-sm leading-7 text-cx-muted">
              The Expo Librarian app gives lead engineers instant access to code
              logic, Blast Radius risks, and mentorship challenges — anywhere,
              without touching a laptop.
            </p>
            <ul className="space-y-3">
              {[
                {
                  icon: Library,
                  text: "Browse summaries for every ingested file",
                },
                { icon: Target, text: "Blast Radius alerts before you push" },
                {
                  icon: GraduationCap,
                  text: "Mentor challenges delivered as push notifications",
                },
              ].map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="flex items-start gap-3 font-mono text-xs text-cx-muted"
                >
                  <Icon size={13} className="mt-0.5 shrink-0 text-cyan-400" />
                  {text}
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-cx-border bg-background py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <BrandLogo size="sm" className="mb-3" />
            <p className="font-mono text-[10px] text-cx-muted/70">
              Architectural intelligence for modern codebases.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-2">
            {[
              { label: "dashboard", href: "/app" },
              { label: "architecture map", href: "/map" },
              {
                label: "github",
                href: "https://github.com/JasDevPH/cortex-path",
              },
              { label: "sign in", href: "/auth" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="flex items-center gap-1.5 font-mono text-[10px] text-cx-muted/70 transition-colors hover:text-cx-muted"
              >
                {label === "github" && <ExternalLink size={10} />}
                {label}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-10 border-t border-cx-border pt-6 text-center">
          <p className="font-mono text-[10px] text-cx-muted/50">
            © {new Date().getFullYear()} CortexPath · Built with Next.js, Groq,
            Neon, and pgvector
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <HeroSection />
      <PillarsSection />
      <MentorMomentSection />
      <MobileSection />
      <Footer />
    </div>
  );
}
