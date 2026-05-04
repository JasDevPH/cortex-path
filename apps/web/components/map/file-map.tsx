"use client";

import { useCallback, useState, useMemo } from "react";
import {
  ReactFlow,
  Background,
  applyNodeChanges,
  NodeChange
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import FileNode from "./file-node";

import { buildTree } from "@/lib/build-tree";
import { generateFlow } from "@/lib/generate-flow";
import { layoutGraph } from "@/lib/layout-graph";
import type { Edge } from "@xyflow/react";

const nodeTypes = {
  fileNode: FileNode,
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
    {
      path: "project/components/ui/nsr.tsx",
      summary: "Navbar component",
    },
    {
      path: "project/components/ui/ns2r.tsx",
      summary: "Navbar component",
    },
    {
      path: "project/components/ui/nsasdfasdfasdfasdfasdfasdfasdr.tsx",
      summary: "Navbar componenslkajsdflkasjdflkasfjlkasjdflajsdfaslkdfjasljfkasdlf",
    },
    {
      path: "project/components/ui/ns3r.tsx",
      summary: "Navbar component",
    },
  ];

  // initial graph
  const initial = useMemo(() => {
    const tree = buildTree(files);
    const flow = generateFlow(tree);
    return layoutGraph(flow.nodes, flow.edges);
  }, [files]);

  const [nodes, setNodes] = useState(initial.nodes);
  const [edges] = useState(initial.edges);
  const [openNodes, setOpenNodes] = useState<Record<string, boolean>>({});

  const toggleNode = (id: string) => {
    setOpenNodes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredNodes = useMemo(() => {
    const hidden = new Set<string>();

    for (const [id, isOpen] of Object.entries(openNodes)) {
      if (!isOpen) {
        const descendants = getDescendants(id, edges);
        descendants.forEach((d) => hidden.add(d));
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
      setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

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