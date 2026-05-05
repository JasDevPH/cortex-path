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

  // PREVENT SSR HYDRATION
  if (!mounted) {
    return null;
  }

  return (
    <div className="w-full h-screen">
      <ReactFlow
        nodes={filteredNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
      </ReactFlow>
    </div>
  );
}