'use client';

import { Handle, Position, NodeProps } from 'reactflow';

export type FileNodeData = {
  label: string;
  path: string;
  summary: string | null;
  isBlastRadius?: boolean;
};

export function FileNode({ data, selected }: NodeProps<FileNodeData>) {
  const isHit = data.isBlastRadius;
  const isSelected = selected;

  return (
    <div
      className={`
        w-52 rounded border px-3 py-2 font-mono text-xs transition-colors
        ${isHit
          ? 'border-red-500 bg-red-950/80 text-red-200 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
          : isSelected
            ? 'border-zinc-400 bg-zinc-800 text-zinc-100'
            : 'border-zinc-700 bg-zinc-900 text-zinc-300'
        }
      `}
    >
      <Handle type="target" position={Position.Top} className="!bg-zinc-600 !border-zinc-500" />
      <div className={`truncate font-semibold ${isHit ? 'text-red-100' : 'text-zinc-100'}`}>
        {data.label}
      </div>
      {data.summary ? (
        <div className={`mt-1 line-clamp-2 leading-relaxed ${isHit ? 'text-red-300' : 'text-zinc-500'}`}>
          {data.summary}
        </div>
      ) : (
        <div className="mt-1 text-zinc-700 italic">no summary yet</div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-zinc-600 !border-zinc-500" />
    </div>
  );
}
