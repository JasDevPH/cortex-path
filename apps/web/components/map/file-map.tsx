"use client";

import {
  useCallback,
  useState,
  useMemo,
  useEffect,
} from "react";

import {
  ReactFlow,
  Background,
  applyNodeChanges,
  NodeChange,
  type Edge,
  type Node,
  Controls,
  MiniMap,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import FileNode from "./file-node";
import LinkFileNode from "./file-node-link";

import { buildTree } from "@/lib/build-tree";
import { generateFlow } from "@/lib/generate-flow";
import { layoutGraph } from "@/lib/layout-graph";

export type FileRecord = {
  path: string;
  summary?: string;
  url?: string;
};

type FileMapProps = {
  files: FileRecord[];
};

const nodeTypes = {
  fileNode: FileNode,
  linkFileNode: LinkFileNode,
};

function getDescendants(nodeId: string, edges: Edge[]) {
  const result = new Set<string>();

  const visit = (id: string) => {
    for (const edge of edges) {
      if (edge.source === id) {
        result.add(edge.target);
        visit(edge.target);
      }
    }
  };

  visit(nodeId);

  return result;
}

export default function FileMap({
  files,
}: FileMapProps) {
  const [mounted, setMounted] = useState(false);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const [openNodes, setOpenNodes] = useState<
    Record<string, boolean>
  >({});

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // CLIENT ONLY GRAPH GENERATION
  useEffect(() => {
    const tree = buildTree(files);

    const flow = generateFlow(tree);

    const layouted = layoutGraph(
      flow.nodes,
      flow.edges
    );

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNodes(layouted.nodes);
    setEdges(layouted.edges);

    setMounted(true);
  }, [files]);

  const toggleNode = (id: string) => {
    setOpenNodes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredNodes = useMemo(() => {
    const hidden = new Set<string>();

    for (const [id, isOpen] of Object.entries(
      openNodes
    )) {
      if (!isOpen) {
        const descendants = getDescendants(
          id,
          edges
        );

        descendants.forEach((d) =>
          hidden.add(d)
        );
      }
    }

    return nodes.map((n) => ({
      ...n,

      hidden: hidden.has(n.id),

      data: {
        ...n.data,

        open: openNodes[n.id] ?? true,

        toggle: toggleNode,
      },
    }));
  }, [nodes, edges, openNodes]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) =>
        applyNodeChanges(changes, nds)
      ),
    []
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onNodeClick = useCallback((_: any, node: Node) => {
    const blastIds = getDescendants(node.id, edges);

    const label =
      blastIds.size === 0
        ? `${node.data.name} — no dependents`
        : `blast radius: ${blastIds.size} file${
            blastIds.size > 1 ? "s" : ""
          } depend on ${node.data.name}`;
    console.log("LABEL:", label);

    setSelectedNode({
      ...node,
      data: {
        ...node.data,
        label,
      },
    });
  }, [edges]);

  // PREVENT SSR HYDRATION
  // if (!mounted) {
  //   return null;
  // }

  const loading = !mounted;
  const isEmpty = mounted && nodes.length === 0;

  // 👇 ADD THESE HERE (before return)
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
        <span className="text-zinc-600">
          [ no files ingested yet ]
        </span>
        <span className="text-zinc-700 text-xs">
          select a project folder to populate the map
        </span>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      {selectedNode && (
        <div className="absolute top-3 left-1/2 z-10 -translate-x-1/2 rounded border border-teal-900/60 bg-zinc-900/90 px-4 py-1.5 font-mono text-xs text-teal-300 backdrop-blur">
           {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {String((selectedNode.data as any).label)}
        </div>
      )}
      <ReactFlow
        nodes={filteredNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls className="border-teal-900/50! bg-zinc-900! shadow-none! [&>button]:border-teal-900/50! [&>button]:bg-zinc-900! [&>button]:text-teal-600!" />
        <MiniMap
          nodeColor={n => (n.data ? '#ef4444' : '#0F766E')}
          maskColor="rgba(9,9,11,0.7)"
          className="border-teal-900/40! bg-zinc-900!"
        />
      </ReactFlow>
    </div>
  );
}