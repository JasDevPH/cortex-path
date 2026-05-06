'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CortexIcon } from './CortexIcon';
import type { ChatMessage as ChatMessageType } from '@/hooks/useChatSessions';

/** Three-dot typing indicator shown while Cortex is generating */
function TypingDots() {
  return (
    <span className="flex items-center gap-[3px] py-0.5">
      {[0, 150, 300].map(delay => (
        <span
          key={delay}
          className="block h-1.5 w-1.5 rounded-full bg-cx-accent"
          style={{ animation: `cortex-bounce 1.1s ease-in-out ${delay}ms infinite` }}
        />
      ))}
    </span>
  );
}

/** Markdown renderers tuned for the compact chat context */
const mdComponents: React.ComponentProps<typeof ReactMarkdown>['components'] = {
  // Paragraphs — no extra margin between streamed chunks
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,

  // Headings
  h1: ({ children }) => <h1 className="mb-1.5 mt-3 text-sm font-bold text-foreground first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-1 mt-3 text-xs font-semibold text-foreground first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-1 mt-2 text-[11px] font-semibold uppercase tracking-wide text-cx-accent first:mt-0">{children}</h3>,

  // Inline emphasis
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  em: ({ children }) => <em className="italic text-cx-text-2">{children}</em>,

  // Inline code
  code: ({ children, className }) => {
    const isBlock = className?.includes('language-');
    if (isBlock) return <code className={className}>{children}</code>;
    return (
      <code className="rounded bg-cx-card-raised px-1 py-0.5 font-mono text-[11px] text-cx-accent ring-1 ring-cx-card-border">
        {children}
      </code>
    );
  },

  // Code block
  pre: ({ children }) => (
    <pre className="my-2 overflow-x-auto rounded-lg bg-cx-card-raised p-3 font-mono text-[11px] leading-relaxed text-cx-text-2 ring-1 ring-cx-card-border">
      {children}
    </pre>
  ),

  // Lists
  ul: ({ children }) => <ul className="mb-2 ml-3 list-disc space-y-0.5">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 ml-3 list-decimal space-y-0.5">{children}</ol>,
  li: ({ children }) => <li className="text-cx-text-2">{children}</li>,

  // Tables (GFM)
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto rounded-lg ring-1 ring-cx-card-border">
      <table className="w-full border-collapse text-[11px]">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-cx-card-raised">{children}</thead>,
  th: ({ children }) => (
    <th className="border-b border-cx-card-border px-3 py-1.5 text-left font-semibold text-foreground">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-cx-card-border/50 px-3 py-1.5 text-cx-text-2 last:border-0">
      {children}
    </td>
  ),

  // Blockquote
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-cx-accent pl-3 text-cx-text-3 italic">
      {children}
    </blockquote>
  ),

  // Horizontal rule
  hr: () => <hr className="my-3 border-cx-card-border" />,

  // Links
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-cx-accent underline underline-offset-2 hover:text-cx-accent-hover">
      {children}
    </a>
  ),
};

export function ChatMessage({ role, content }: ChatMessageType) {
  const isUser = role === 'user';
  const isEmpty = !content;

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-foreground px-3.5 py-2.5 text-xs leading-relaxed text-background">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-2.5 ${isEmpty ? 'items-center' : 'items-start'}`}>
      {/* Cortex avatar */}
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cx-accent-bg text-cx-accent ring-1 ring-cx-accent-border">
        <CortexIcon size={11} />
      </div>

      {/* Message body */}
      <div className="min-w-0 flex-1 text-xs leading-relaxed text-cx-text-2">
        {isEmpty ? (
          <TypingDots />
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
            {content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}
