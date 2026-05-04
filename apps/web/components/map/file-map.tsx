"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import FileNode from "./file-node";

import { buildTree } from "@/lib/build-tree";
import { generateFlow } from "@/lib/generate-flow";
import { layoutGraph } from "@/lib/layout-graph";
import { useMemo } from "react";

const nodeTypes = {
  fileNode: FileNode,
};

export default function FileMap() {
  const files = [
    {
      path: "project/app/page.tsx",
      summary: "Main page",
    },
    {
      path: "project/components/ui/navbar.tsx",
      summary: "Navbar component",
    },
  ];

  // initial graph
  const tree = buildTree(files);
  const flow = generateFlow(tree);
  const layouted = layoutGraph(flow.nodes, flow.edges);

  const initial = useMemo(() => {
    const tree = buildTree(files);
    const flow = generateFlow(tree);
    return layoutGraph(flow.nodes, flow.edges);
  }, []);
  const [nodes, setNodes] = useState(initial.nodes);
  const [edges] = useState(initial.edges);
  const [openNodes, setOpenNodes] = useState<Record<string, boolean>>({});

  const toggleNode = (id: string) => {
    setOpenNodes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const nodesWithState = useMemo(() => {
    return nodes.map((n) => ({
      ...n,
      data: {
        ...n.data,
        open: !!openNodes[n.id],
        toggle: toggleNode,
      },
    }));
  }, [nodes, openNodes]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  return (
    <div className="w-full h-screen">
      <ReactFlow
        nodes={nodesWithState}
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