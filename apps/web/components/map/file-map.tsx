"use client";

import {
  ReactFlow,
  Background,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import FileNode from "./file-node";

import { buildTree } from "@/lib/build-tree";
import { generateFlow } from "@/lib/generate-flow";

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

  const tree = buildTree(files);

  const { nodes, edges } = generateFlow(tree);

  return (
    <div className="w-full h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
      </ReactFlow>
    </div>
  );
}