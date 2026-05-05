'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import ReactFlow, {
  Node,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  NodeMouseHandler,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { FileNode } from './FileNode';

const nodeTypes = { fileNode: FileNode };

type RawNode = {
  id: string;
  data: { label: string; path: string; summary: string | null };
  position: { x: number; y: number };
};
type RawEdge = { id: string; source: string; target: string };

function layoutGrid(nodes: RawNode[]): Node[] {
  const cols = Math.max(Math.ceil(Math.sqrt(nodes.length)), 1);
  return nodes.map((node, i) => ({
    ...node,
    type: 'fileNode',
    position: {
      x: (i % cols) * 300,
      y: Math.floor(i / cols) * 200,
    },
  }));
}

export function ArchitectureMap() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);
  const [blastLabel, setBlastLabel] = useState<string | null>(null);

  const rawEdgesRef = useRef<RawEdge[]>([]);
  const selectedIdRef = useRef<string | null>(null);

  useEffect(() => {
    fetch('/api/graph')
      .then(r => r.json())
      .then((data: { nodes: RawNode[]; edges: RawEdge[] }) => {
        rawEdgesRef.current = data.edges;
        if (data.nodes.length === 0) {
          setIsEmpty(true);
        } else {
          setNodes(layoutGrid(data.nodes));
          setEdges(data.edges.map(e => ({ ...e, style: { stroke: '#0F766E' }, animated: false })));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [setNodes, setEdges]);

  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      const isSame = selectedIdRef.current === node.id;
      selectedIdRef.current = isSame ? null : node.id;

      if (isSame) {
        setBlastLabel(null);
        setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, isBlastRadius: false } })));
        setEdges(rawEdgesRef.current.map(e => ({ ...e, style: { stroke: '#0F766E' }, animated: false })));
        return;
      }

      const blastIds = new Set(
        rawEdgesRef.current.filter(e => e.target === node.id).map(e => e.source)
      );

      setBlastLabel(
        blastIds.size === 0
          ? `${node.data.label} — no dependents`
          : `blast radius: ${blastIds.size} file${blastIds.size > 1 ? 's' : ''} depend on ${node.data.label}`
      );

      setNodes(nds =>
        nds.map(n => ({ ...n, data: { ...n.data, isBlastRadius: blastIds.has(n.id) } }))
      );

      setEdges(
        rawEdgesRef.current.map(e => ({
          ...e,
          style: {
            stroke: blastIds.has(e.source) && e.target === node.id ? '#ef4444' : '#0F766E',
            strokeWidth: blastIds.has(e.source) && e.target === node.id ? 2 : 1,
          },
          animated: blastIds.has(e.source) && e.target === node.id,
        }))
      );
    },
    [setNodes, setEdges]
  );

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#09090b] font-mono text-sm text-teal-700">
        <span className="animate-pulse">scanning cortex map...</span>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-[#09090b] font-mono text-sm">
        <span className="text-zinc-600">[ no files ingested yet ]</span>
        <span className="text-zinc-700 text-xs">select a project folder to populate the map</span>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-[#09090b]">
      {blastLabel && (
        <div className="absolute top-3 left-1/2 z-10 -translate-x-1/2 rounded border border-teal-900/60 bg-zinc-900/90 px-4 py-1.5 font-mono text-xs text-teal-300 backdrop-blur">
          {blastLabel}
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
      >
        <Background
          color="#134E4A"
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
        />
        <Controls className="border-teal-900/50! bg-zinc-900! shadow-none! [&>button]:border-teal-900/50! [&>button]:bg-zinc-900! [&>button]:text-teal-600!" />
        <MiniMap
          nodeColor={n => (n.data?.isBlastRadius ? '#ef4444' : '#0F766E')}
          maskColor="rgba(9,9,11,0.7)"
          className="border-teal-900/40! bg-zinc-900!"
        />
      </ReactFlow>
    </div>
  );
}
