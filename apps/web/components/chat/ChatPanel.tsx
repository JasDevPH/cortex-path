'use client';

import { useRef, useEffect, useState, KeyboardEvent } from 'react';
import { SendHorizontal, Clock, Plus, X, Trash2, MessageSquare, Maximize2, Minimize2, Minus } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { CortexIcon } from './CortexIcon';
import type { ChatSession } from '@/hooks/useChatSessions';

type ChatPanelProps = {
  sessions: ChatSession[];
  activeId: string;
  activeSession: ChatSession | null;
  isLoading: boolean;
  isThrottled: boolean;
  isFullView: boolean;
  onSend: (text: string) => void;
  onNewSession: () => void;
  onSwitchSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onExpand: () => void;    // panel → full view
  onRestore: () => void;   // full view → panel
  onMinimize: () => void;  // close entirely, show floating button
};

function groupSessions(sessions: ChatSession[]) {
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const yesterdayStart = todayStart - 86_400_000;
  return [
    { label: 'Today',     items: sessions.filter(s => s.updatedAt >= todayStart) },
    { label: 'Yesterday', items: sessions.filter(s => s.updatedAt >= yesterdayStart && s.updatedAt < todayStart) },
    { label: 'Older',     items: sessions.filter(s => s.updatedAt < yesterdayStart) },
  ].filter(g => g.items.length > 0);
}

const HINTS = [
  'Where is auth handled?',
  'Which files import useIngestor?',
  'Explain the ingestion pipeline',
];

export function ChatPanel({
  sessions,
  activeId,
  activeSession,
  isLoading,
  isThrottled,
  isFullView,
  onSend,
  onNewSession,
  onSwitchSession,
  onDeleteSession,
  onExpand,
  onRestore,
  onMinimize,
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messages = activeSession?.messages ?? [];
  const groups = groupSessions(sessions);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading || isThrottled) return;
    onSend(text);
    setInput('');
    // reset textarea height
    if (inputRef.current) inputRef.current.style.height = 'auto';
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const containerClass = isFullView
    ? 'flex h-full w-full flex-col border-l border-cx-card-border bg-cx-card'
    : 'flex h-[580px] w-[560px] flex-col overflow-hidden rounded-2xl border border-cx-card-border bg-cx-card shadow-2xl';

  const sidebarWidth = isFullView ? 'w-52' : 'w-44';

  return (
    <div className={containerClass}>

      {/* ── Header ── */}
      <div className="flex shrink-0 items-center gap-2.5 border-b border-cx-card-border px-4 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cx-accent-bg text-cx-accent ring-1 ring-cx-accent-border">
          <CortexIcon size={15} />
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="text-sm font-semibold leading-none text-foreground">Cortex</span>
          <span className="mt-0.5 font-mono text-[10px] text-cx-text-3">AI codebase assistant</span>
        </div>

        <div className="ml-auto flex items-center gap-1">
          {/* New chat */}
          <button
            onClick={onNewSession}
            title="New conversation"
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-medium text-cx-text-2 transition-colors hover:bg-cx-card-raised hover:text-foreground"
          >
            <Plus size={12} />
            New chat
          </button>

          <div className="mx-1 h-4 w-px bg-cx-card-border" />

          {isFullView ? (
            <>
              {/* Restore to panel size */}
              <button
                onClick={onRestore}
                title="Restore to panel size"
                className="rounded-md p-1.5 text-cx-text-3 transition-colors hover:bg-cx-card-raised hover:text-foreground"
              >
                <Minimize2 size={14} />
              </button>
              {/* Minimize — close entirely */}
              <button
                onClick={onMinimize}
                title="Minimize"
                className="rounded-md p-1.5 text-cx-text-3 transition-colors hover:bg-cx-card-raised hover:text-foreground"
              >
                <Minus size={14} />
              </button>
            </>
          ) : (
            <>
              {/* Expand to full view */}
              <button
                onClick={onExpand}
                title="Full view"
                className="rounded-md p-1.5 text-cx-text-3 transition-colors hover:bg-cx-card-raised hover:text-foreground"
              >
                <Maximize2 size={14} />
              </button>
              {/* Close (minimize to floating button) */}
              <button
                onClick={onMinimize}
                title="Close"
                className="rounded-md p-1.5 text-cx-text-3 transition-colors hover:bg-cx-card-raised hover:text-foreground"
              >
                <X size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Body: sidebar + chat ── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">

        {/* Sidebar */}
        <div className={`flex ${sidebarWidth} shrink-0 flex-col border-r border-cx-card-border`}>
          <div className="flex-1 overflow-y-auto py-2">
            {groups.length === 0 ? (
              <p className="px-3 py-2 text-[10px] text-cx-text-3">No conversations yet</p>
            ) : (
              groups.map(group => (
                <div key={group.label} className="mb-1">
                  <p className="px-3 py-1 font-mono text-[9px] uppercase tracking-widest text-cx-text-3">
                    {group.label}
                  </p>
                  {group.items.map(session => (
                    <div
                      key={session.id}
                      onMouseEnter={() => setHoveredId(session.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className={`group relative flex cursor-pointer items-center gap-2 px-3 py-2 transition-colors ${
                        session.id === activeId
                          ? 'bg-cx-accent-bg text-foreground'
                          : 'text-cx-text-2 hover:bg-cx-card-raised hover:text-foreground'
                      }`}
                      onClick={() => onSwitchSession(session.id)}
                    >
                      <MessageSquare size={11} className="shrink-0 opacity-60" />
                      <span className="flex-1 truncate text-[11px]">{session.title}</span>
                      {hoveredId === session.id && (
                        <button
                          onClick={e => { e.stopPropagation(); onDeleteSession(session.id); }}
                          title="Delete conversation"
                          className="absolute right-2 rounded p-0.5 text-cx-text-3 opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
                        >
                          <Trash2 size={10} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cx-accent-bg text-cx-accent ring-1 ring-cx-accent-border">
                  <CortexIcon size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Ask Cortex anything</p>
                  <p className="mt-1 text-xs text-cx-text-3">
                    about your codebase — architecture, logic, dependencies
                  </p>
                </div>
                <div className="mt-1 flex flex-col gap-1.5">
                  {HINTS.map(hint => (
                    <button
                      key={hint}
                      onClick={() => { setInput(hint); inputRef.current?.focus(); }}
                      className="rounded-lg border border-cx-card-border px-3 py-1.5 text-left text-[11px] text-cx-text-3 transition-colors hover:border-cx-accent-border hover:text-cx-text-2"
                    >
                      &ldquo;{hint}&rdquo;
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <ChatMessage key={i} role={msg.role} content={msg.content} />
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 border-t border-cx-card-border px-3 py-3">
            <div className="flex items-end gap-2 rounded-xl border border-cx-card-border bg-cx-card-raised px-3 py-2 focus-within:border-cx-accent-border focus-within:ring-1 focus-within:ring-cx-accent-border/40">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask Cortex about your codebase..."
                disabled={isLoading}
                className="max-h-[120px] flex-1 resize-none bg-transparent text-xs text-foreground outline-none placeholder:text-cx-text-3 disabled:opacity-50"
                style={{ lineHeight: '1.5', minHeight: '20px' }}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || isThrottled || !input.trim()}
                className="mb-0.5 shrink-0 rounded-lg p-1.5 text-cx-accent transition-colors hover:bg-cx-accent-bg disabled:opacity-30"
              >
                {isThrottled ? <Clock size={14} /> : <SendHorizontal size={14} />}
              </button>
            </div>
            <p className="mt-1.5 text-center font-mono text-[9px] text-cx-text-3">
              Enter to send · Shift+Enter for new line
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
