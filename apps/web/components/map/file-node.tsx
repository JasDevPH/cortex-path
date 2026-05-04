"use client";

import { Handle, Position } from "@xyflow/react";
import { Folder, File } from "lucide-react";

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
                e.stopPropagation();
                
                // console.log("NODE", id, data.open);
                data.toggle(id);
      }}
      className="relative rounded-2xl border border-zinc-700 bg-zinc-900 p-4 w-64 shadow-lg cursor-pointer"
    >
      <Handle type="target" position={Position.Top} />

      <div className="flex items-center gap-2 text-white font-semibold">
        {folder ? (
          <Folder size={16} className="text-yellow-400" />
        ) : (
          <File size={16} className="text-blue-400" />
        )}

        {data.name}
      </div>

      {data.open && data.summary && (
        <div className="text-sm text-zinc-400 mt-2">
          {data.summary}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}