import {
  MarkerType,
  type Edge,
  type Node,
} from "@xyflow/react";

import type { TreeNode } from "./build-tree";

type FlowResult = {
  nodes: Node[];
  edges: Edge[];
};

export function generateFlow(tree: Record<string, TreeNode>): FlowResult {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  function traverse(
    node: TreeNode,
    parentId: string | null = null,
    depth = 0,
    y = 0
  ) {
    const nodeId = parentId
      ? `${parentId}/${node.name}`
      : node.name;

    nodes.push({
      id: nodeId,
      position: {
        x: depth * 250,
        y,
      },
      data: {
        name: node.name,
        summary: node.summary,
        url: node.url,
      },
      type: node.url ? "linkFileNode" : "fileNode",
    });

    if (parentId) {
      edges.push({
        id: `${parentId}-${nodeId}`,
        source: parentId,
        target: nodeId,
        type: "smoothstep",
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      });
    }

    let index = 0;

    for (const child of Object.values(node.children)) {
      traverse(child, nodeId, depth + 1, y + index * 120);
      index++;
    }
  }

  // 👇 IMPORTANT: multiple roots now
  for (const rootNode of Object.values(tree)) {
    traverse(rootNode);
  }

  return { nodes, edges };
}