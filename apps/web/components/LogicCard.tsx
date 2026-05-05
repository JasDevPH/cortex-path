'use client';

import { useState, useMemo, useEffect } from 'react';
import { Copy, Check, Cpu, Clipboard, Wand2, Bookmark, Building2, Brain, Shield, Zap, Layers, Target, Leaf, GraduationCap, X, ArrowRight, ArrowLeft } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { buildGoldenPrompt } from '@/lib/context/golden-prompt';

import { SavedPromptsModal } from '@/components/SavedPromptsModal';

type LogicCardProps = {
  fileName: string;
  filePath: string;
  summary: string;
  isLoading: boolean;
  code?: string;
  imports?: string[];
  exports?: string[];
};

type Enhancement = { id: string; label: string; text: string };

const ENHANCEMENT_PATTERNS: { id: string; label: string; key: string }[] = [
  { id: 'security',     label: 'Security Fix',    key: 'Enhancement' },
  { id: 'optimization', label: 'Optimization',    key: 'Tuning' },
  { id: 'system',       label: 'System Design',   key: 'Standardization' },
  { id: 'blast',        label: 'Blast Radius',    key: 'Downstream Ripple' },
  { id: 'mentor',       label: 'Mentor Challenge',key: 'The Leap' },
];

const ENHANCEMENT_ICONS: Record<string, LucideIcon> = {
  security:     Shield,
  optimization: Zap,
  system:       Layers,
  blast:        Target,
  mentor:       GraduationCap,
};

const LS_PROMPT_PREFIX = 'cortex:prompt:';

function extractEnhancements(markdown: string): Enhancement[] {
  return ENHANCEMENT_PATTERNS.flatMap(({ id, label, key }) => {
    const regex = new RegExp(`\\*\\*${key}\\*\\*:?\\s*(.+?)(?=\\n|$)`, 'i');
    const match = markdown.match(regex);
    return match ? [{ id, label, text: match[1].replace(/\*/g, '').trim() }] : [];
  });
}

function buildPromptContent(filePath: string, code: string, items: Enhancement[]): string {
  const list = items.map((e, i) => `${i + 1}. [${e.label}] ${e.text}`).join('\n');
  return `Act as a senior software engineer reviewing \`${filePath}\`.

Please implement the following enhancements:

${list}

Here is the current code:
\`\`\`
${code || '// (source not available — apply changes conceptually)'}
\`\`\`

For each enhancement, provide the updated code and a one-line explanation of the change.`;
}

// ─── Skeleton loader ─────────────────────────────────────────────────────────

const ANALYZE_MSGS = [
  'Parsing AST structure...',
  'Running Groq logic analysis...',
  'Mapping architectural blueprint...',
  'Evaluating security surface...',
  'Calculating blast radius...',
  'Generating mentor challenge...',
  'Synthesising logic narrative...',
  'Extracting wisdom from your code...',
];

const SKELETON_SECTIONS = [
  { w: 44, lines: [92, 78, 85] },
  { w: 40, lines: [82, 96] },
  { w: 48, lines: [70, 88, 62] },
  { w: 36, lines: [90, 74] },
  { w: 42, lines: [66, 80, 94] },
];

function SkeletonView({ msgIdx }: { msgIdx: number }) {
  return (
    <div className="space-y-5">
      {/* Live status row */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cx-accent opacity-50" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cx-accent" />
        </span>
        <span className="font-mono text-[10px] text-cx-accent-muted">
          {ANALYZE_MSGS[msgIdx]}
        </span>
      </div>

      {/* File metadata skeleton */}
      <div className="space-y-2 rounded border border-cx-card-border bg-cx-card-raised p-3">
        <div className="h-2 w-3/4 animate-pulse rounded bg-cx-card-border" />
        <div className="h-2 w-1/2 animate-pulse rounded bg-cx-card-border" />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[56, 80, 48, 68, 60].map((w, i) => (
            <div
              key={i}
              className="h-4 animate-pulse rounded bg-cx-card-border"
              style={{ width: w }}
            />
          ))}
        </div>
      </div>

      {/* Section skeletons */}
      {SKELETON_SECTIONS.map(({ w, lines }, si) => (
        <div key={si} className="space-y-2">
          <div className="flex items-center gap-1.5 pb-0.5">
            <div className="h-2 w-2 animate-pulse rounded-full bg-cx-accent-border" />
            <div
              className="h-2 animate-pulse rounded bg-cx-accent-bg"
              style={{ width: w * 3 }}
            />
          </div>
          {lines.map((pct, li) => (
            <div
              key={li}
              className="h-2 animate-pulse rounded bg-cx-card-border"
              style={{ width: `${pct}%`, animationDelay: `${li * 80}ms` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function EnhancementModal({
  fileName,
  filePath,
  code,
  summary,
  onClose,
}: {
  fileName: string;
  filePath: string;
  code: string;
  summary: string;
  onClose: () => void;
}) {
  const enhancements = useMemo(() => extractEnhancements(summary), [summary]);
  const [step, setStep] = useState<1 | 2>(1);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [prompt, setPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggle = (id: string) =>
    setChecked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleGenerate = () => {
    const selected = enhancements.filter(e => checked.has(e.id));
    if (!selected.length) return;
    setPrompt(buildPromptContent(filePath, code, selected));
    setStep(2);
  };

  useEffect(() => {
    if (step !== 2 || !prompt) return;
    try { localStorage.setItem(LS_PROMPT_PREFIX + filePath, prompt); } catch { /* quota */ }
    fetch('/api/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath, fileName, content: prompt }),
    }).then(() => setSaved(true)).catch(() => {});
  }, [step, prompt, filePath, fileName]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative flex w-full max-w-4xl flex-col rounded-xl border border-cx-card-border bg-cx-card shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-cx-card-border px-6 py-4">
          <div className="flex items-center gap-2">
            <Wand2 size={13} className="text-cx-accent" />
            <span className="font-mono text-sm font-medium text-foreground">Enhancement Studio</span>
          </div>
          <button onClick={onClose} className="text-cx-text-3 transition-colors hover:text-foreground">
            <X size={15} />
          </button>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-3 border-b border-cx-card-border px-6 py-3">
          {/* Step 1 */}
          <div className={`flex items-center gap-2 font-mono text-xs ${step === 1 ? 'text-cx-accent' : 'text-cx-accent-muted'}`}>
            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold ${
              step > 1
                ? 'border-cx-accent bg-cx-accent text-white'
                : 'border-cx-accent text-cx-accent'
            }`}>
              {step > 1 ? <Check size={10} /> : '1'}
            </div>
            select enhancements
          </div>
          <div className={`h-px flex-1 ${step > 1 ? 'bg-cx-accent-border' : 'bg-cx-card-border'}`} />
          {/* Step 2 */}
          <div className={`flex items-center gap-2 font-mono text-xs ${step === 2 ? 'text-cx-accent' : 'text-cx-text-3'}`}>
            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold ${
              step === 2 ? 'border-cx-accent text-cx-accent' : 'border-cx-card-border text-cx-text-3'
            }`}>
              2
            </div>
            generated prompt
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[65vh] overflow-y-auto px-6 py-5">
          {step === 1 ? (
            <div className="space-y-3">
              {enhancements.length === 0 ? (
                <p className="font-mono text-xs text-cx-text-3">No enhancements found in this summary yet.</p>
              ) : (
                enhancements.map(e => (
                  <label
                    key={e.id}
                    className="group flex cursor-pointer items-start gap-3 rounded-lg border border-cx-card-border bg-cx-card-raised p-3.5 transition-all hover:border-cx-accent-border hover:bg-cx-accent-bg"
                  >
                    <input
                      type="checkbox"
                      checked={checked.has(e.id)}
                      onChange={() => toggle(e.id)}
                      className="mt-0.5 shrink-0 accent-teal-500"
                    />
                    <div>
                      <p className="flex items-center gap-1.5 font-mono text-xs font-semibold text-foreground transition-colors">
                        {(() => { const Icon = ENHANCEMENT_ICONS[e.id]; return Icon ? <Icon size={11} className="shrink-0 text-cx-accent-hover" /> : null; })()}
                        {e.label}
                      </p>
                      <p className="mt-1 font-mono text-[10px] leading-relaxed text-cx-text-3">
                        {e.text}
                      </p>
                    </div>
                  </label>
                ))
              )}
            </div>
          ) : (
            <textarea
              readOnly
              value={prompt}
              className="h-[480px] w-full resize-none rounded border border-cx-card-border bg-cx-card-raised p-4 font-mono text-sm leading-7 text-cx-text-2 outline-none"
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-cx-card-border px-6 py-4">
          {step === 1 ? (
            <>
              <span className="font-mono text-[10px] text-cx-text-3">
                {checked.size} selected
              </span>
              <button
                onClick={handleGenerate}
                disabled={checked.size === 0}
                className="flex items-center gap-2 rounded border border-cx-accent-border bg-cx-accent-bg px-4 py-2 font-mono text-xs text-cx-accent transition-all hover:border-cx-accent hover:bg-cx-accent-bg disabled:cursor-not-allowed disabled:opacity-30"
              >
                Generate Prompt <ArrowRight size={11} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 font-mono text-xs text-cx-text-3 transition-colors hover:text-foreground"
              >
                <ArrowLeft size={11} /> Back
              </button>
              <div className="flex items-center gap-2">
                {saved && (
                  <span className="font-mono text-[10px] text-cx-accent-muted">auto-saved ·</span>
                )}
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded border border-cx-card-border px-4 py-2 font-mono text-xs text-foreground transition-all hover:border-cx-accent-border"
                >
                  {copied ? <Check size={11} className="text-cx-accent" /> : <Copy size={11} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export function LogicCard({
  fileName,
  filePath,
  summary,
  isLoading,
  code = '',
  imports = [],
  exports = [],
}: LogicCardProps) {
  const [copied, setCopied] = useState(false);
  const [copiedCtx, setCopiedCtx] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showEnhance, setShowEnhance] = useState(false);
  const [analyzeMsg, setAnalyzeMsg] = useState(0);

  useEffect(() => {
    if (!isLoading) return;
    const id = setInterval(() => setAnalyzeMsg(i => (i + 1) % ANALYZE_MSGS.length), 2000);
    return () => clearInterval(id);
  }, [isLoading]);

  const copy = async () => {
    if (!summary) return;
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyContext = async () => {
    if (!summary) return;
    const xml = buildGoldenPrompt({ fileName, code, summary, imports, impactedBy: [] });
    await navigator.clipboard.writeText(xml);
    setCopiedCtx(true);
    setTimeout(() => setCopiedCtx(false), 2000);
  };

  if (!summary && !isLoading) {
    return (
      <>
        <div className="flex h-full flex-col items-center justify-center gap-2">
          <Cpu size={22} className="text-cx-accent-muted" />
          <span className="font-mono text-xs text-cx-text-3">click a file to analyze it</span>
          <button
            onClick={() => setShowSaved(true)}
            className="mt-3 flex items-center gap-1.5 font-mono text-[10px] text-cx-text-3 transition-colors hover:text-cx-accent"
          >
            <Bookmark size={10} />
            view saved prompts
          </button>
        </div>
        {showSaved && <SavedPromptsModal onClose={() => setShowSaved(false)} />}
      </>
    );
  }

  const displayContent = summary + (isLoading ? ' ▊' : '');

  return (
    <>
      <div className="flex h-full flex-col gap-3">
        <div className="flex items-center justify-between border-b border-cx-card-border pb-3">
          <span className="truncate font-mono text-xs text-cx-text-3">
            {fileName || 'untitled'}
          </span>
          <div className="flex shrink-0 items-center gap-3">
            <button
              onClick={() => setShowSaved(true)}
              className="flex items-center gap-1.5 font-mono text-xs text-cx-text-3 transition-colors hover:text-cx-accent"
            >
              <Bookmark size={11} />
              saved
            </button>
            <button
              onClick={copy}
              disabled={!summary}
              className="flex items-center gap-1.5 font-mono text-xs text-cx-text-3 transition-colors hover:text-cx-accent disabled:opacity-0"
            >
              {copied ? <Check size={11} className="text-cx-accent" /> : <Copy size={11} />}
              {copied ? 'copied' : 'copy'}
            </button>
            <button
              onClick={copyContext}
              disabled={!summary}
              className="flex items-center gap-1.5 font-mono text-xs text-cx-text-3 transition-colors hover:text-cx-accent disabled:opacity-0"
            >
              {copiedCtx ? <Check size={11} className="text-cx-accent" /> : <Clipboard size={11} />}
              {copiedCtx ? 'copied' : 'copy context'}
            </button>
            <button
              onClick={() => setShowEnhance(true)}
              disabled={!summary || isLoading}
              className="flex items-center gap-1.5 font-mono text-xs text-cx-accent-muted transition-colors hover:text-cx-accent disabled:opacity-0"
            >
              <Wand2 size={11} />
              enhance
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-2">
          {/* File metadata header */}
          {(filePath || imports.length > 0 || exports.length > 0) && (
            <div className="mb-4 rounded border border-cx-card-border bg-cx-card-raised p-3 space-y-2">
              {filePath && (
                <p className="font-mono text-[10px] text-cx-text-3 break-all leading-relaxed">
                  {filePath}
                </p>
              )}
              {imports.length > 0 && (
                <div>
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-cx-accent-muted">
                    Imports
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {imports.map(imp => (
                      <span key={imp} className="rounded bg-cx-card-raised px-1.5 py-0.5 font-mono text-[10px] text-cx-text-2 border border-cx-card-border">
                        {imp}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {exports.length > 0 && (
                <div>
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-cx-accent-muted">
                    Exports
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {exports.map(exp => (
                      <span key={exp} className="rounded bg-cx-card-raised px-1.5 py-0.5 font-mono text-[10px] text-cx-text-2 border border-cx-card-border">
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {isLoading && !summary ? (
            <SkeletonView msgIdx={analyzeMsg} />
          ) : (
            <ReactMarkdown
              components={{
                h3: ({ children }) => {
                  const SECTION_ICONS: Record<string, LucideIcon> = {
                    '1': Building2,
                    '2': Brain,
                    '3': Shield,
                    '4': Zap,
                    '5': Layers,
                    '6': Target,
                    '7': Leaf,
                    '8': GraduationCap,
                  };
                  const ROMAN: Record<string, string> = {
                    '1': 'I', '2': 'II', '3': 'III', '4': 'IV',
                    '5': 'V', '6': 'VI', '7': 'VII', '8': 'VIII',
                  };
                  const raw = String(children ?? '');
                  const numMatch = raw.match(/^(\d+)\./);
                  const Icon = numMatch ? SECTION_ICONS[numMatch[1]] : null;
                  const roman = numMatch ? ROMAN[numMatch[1]] : null;
                  const cleaned = raw
                    .replace(/^\d+\.\s*/, '')
                    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
                    .trim();
                  return (
                    <h3 className="mb-2 mt-5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-cx-accent first:mt-0">
                      {Icon && <Icon size={11} className="shrink-0" />}
                      {roman && <span>{roman}.</span>}
                      {cleaned}
                    </h3>
                  );
                },
                h2: ({ children }) => (
                  <h2 className="mb-2 mt-5 font-mono text-xs uppercase tracking-widest text-cx-accent first:mt-0">
                    {children}
                  </h2>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-foreground">{children}</strong>
                ),
                p: ({ children }) => (
                  <p className="mb-3 font-mono text-sm leading-6 text-cx-text-2 last:mb-0">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="mb-3 space-y-1 last:mb-0">{children}</ul>
                ),
                li: ({ children }) => (
                  <li className="flex gap-2 font-mono text-sm leading-6 text-cx-text-2">
                    <span className="mt-1 shrink-0 text-cx-accent-muted">›</span>
                    <span>{children}</span>
                  </li>
                ),
                code: ({ children }) => (
                  <code className="rounded bg-cx-card-raised px-1 py-0.5 font-mono text-xs text-cx-lime border border-cx-card-border">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="mb-3 overflow-x-auto rounded border border-cx-card-border bg-cx-card-raised p-3 font-mono text-xs text-cx-text-2 last:mb-0">
                    {children}
                  </pre>
                ),
              }}
            >
              {displayContent}
            </ReactMarkdown>
          )}
        </div>
      </div>

      {showSaved && <SavedPromptsModal onClose={() => setShowSaved(false)} />}
      {showEnhance && summary && !isLoading && (
        <EnhancementModal
          fileName={fileName}
          filePath={filePath}
          code={code}
          summary={summary}
          onClose={() => setShowEnhance(false)}
        />
      )}
    </>
  );
}
