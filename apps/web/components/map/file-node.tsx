"use client";

import { Handle, Position } from "@xyflow/react";
import { Folder, File, ChevronDown, ChevronRight } from "lucide-react";

type FileNodeProps = {
  id: string;
  data: {
    name: string;
    summary?: string;
    open?: boolean;
    toggle?: (id: string) => void;
  };
};

const isFile = (name: string) =>
  /\.[a-z]+$/i.test(name);

export default function FileNode({ id, data }: FileNodeProps) {

  const file = isFile(data.name);
  const folder = !file;

  return (
    <div
      onClick={(e) => {
        // e.stopPropagation();
        data.toggle?.(id);
      }}
      className="relative rounded-2xl border border-zinc-700 bg-zinc-900 p-4 w-64 shadow-lg cursor-pointer break-words"
    >
      <Handle type="target" position={Position.Top} />

      {/* header */}
      <div className="flex items-start gap-2 text-white font-semibold break-words">
        
        {folder ? (
          <Folder size={16} className="text-yellow-400 mt-0.5 shrink-0" />
        ) : (
          <File size={16} className="text-blue-400 mt-0.5 shrink-0" />
        )}

        {/* name */}
        <div className="flex-1 min-w-0">
          <div className="break-words whitespace-normal">
            {data.name}
          </div>
        </div>

        <div className="text-zinc-400 mt-0.5 shrink-0">
            {data.open ? (
                <ChevronDown size={16} />
            ) : (
                <ChevronRight size={16} />
            )}
        </div>
      </div>

      {/* summary */}
      {data.open && data.summary && (
        <div className="text-sm text-zinc-400 mt-2 break-words">
          {data.summary}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}