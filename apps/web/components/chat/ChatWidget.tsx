'use client';

import { useState } from 'react';
import { CortexIcon } from './CortexIcon';
import { ChatPanel } from './ChatPanel';
import { useChatSessions } from '@/hooks/useChatSessions';

type PanelSize = 'closed' | 'panel' | 'full';

export function ChatWidget() {
  const [size, setSize] = useState<PanelSize>('closed');

  const {
    sessions,
    activeId,
    activeSession,
    isLoading,
    isThrottled,
    send,
    newSession,
    switchSession,
    deleteSession,
  } = useChatSessions();

  const hasHistory = sessions.some(s => s.messages.length > 0);
  const panelProps = {
    sessions,
    activeId,
    activeSession,
    isLoading,
    isThrottled,
    onSend: send,
    onNewSession: newSession,
    onSwitchSession: switchSession,
    onDeleteSession: deleteSession,
    onExpand:   () => setSize('full'),
    onRestore:  () => setSize('panel'),
    onMinimize: () => setSize('closed'),
  };

  return (
    <>
      {/* ── Full-view panel — right-side overlay ── */}
      {size === 'full' && (
        <div className="fixed inset-y-0 right-0 z-50 w-1/2 shadow-2xl">
          <ChatPanel {...panelProps} isFullView={true} />
        </div>
      )}

      {/* ── Normal panel + floating button — anchored bottom-right ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {size === 'panel' && (
          <ChatPanel {...panelProps} isFullView={false} />
        )}

        {/* Floating toggle — hidden while any panel is open */}
        {size === 'closed' && (
          <button
            onClick={() => setSize('panel')}
            aria-label="Open Cortex"
            title="Cortex — AI assistant"
            className="group relative flex h-12 w-12 items-center justify-center rounded-full border border-cx-card-border bg-cx-card text-cx-text-2 shadow-lg transition-all duration-200 hover:border-cx-accent-border hover:text-cx-accent hover:shadow-cx-accent/10"
          >
            <CortexIcon size={20} />
            {hasHistory && (
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-cx-accent ring-2 ring-cx-card" />
            )}
          </button>
        )}
      </div>
    </>
  );
}
