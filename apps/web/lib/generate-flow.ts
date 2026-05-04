// lib/generate-flow.ts

import type { Edge, Node } from "@xyflow/react";
import type { TreeNode } from "./build-tree";

type FlowResult = {
  nodes: Node[];
  edges: Edge[];
};

export function generateFlow(tree: TreeNode): FlowResult {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  function traverse(
    node: TreeNode,
    parentId: string | null = null,
    depth = 0,
    y = 0
  ) {
    let index = 0;

    for (const [key, value] of Object.entries(node)) {
      if (key === "__summary") continue;

      const id = parentId
        ? `${parentId}/${key}`
        : key;

      const child = value as TreeNode;

      nodes.push({
        id,
        position: {
          x: depth * 250,
          y: y + index * 120,
        },
        data: {
          name: key,
          summary: child.__summary,
        },
        type: "fileNode",
      });

      if (parentId) {
        edges.push({
          id: `${parentId}-${id}`,
          source: parentId,
          target: id,
        });
      }

      traverse(
        child,
        id,
        depth + 1,
        y + index * 120
      );

      index++;
    }
  }

  traverse(tree);

  return {
    nodes,
    edges,
  };
}