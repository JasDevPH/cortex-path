"use client";

type FileNodeProps = {
  data: {
    name: string;
    summary?: string;
  };
};

export default function FileNode({
  data,
}: FileNodeProps) {
  return (
    <div className="rounded-2xl border border-zinc-700 bg-zinc-900 p-4 w-64 shadow-lg">
      <div className="font-semibold text-white">
        {data.name}
      </div>

      {data.summary && (
        <div className="text-sm text-zinc-400 mt-2">
          {data.summary}
        </div>
      )}
    </div>
  );
}