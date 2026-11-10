import type { XYPosition } from "@xyflow/react";
import type { EdgeType, NodeType } from "./Flow-Helpers";

export const FLOW_STEP_MIME_TYPE = "application/x-flowentis-step";
export type FlowStepKind = "trigger" | "action";

export function parseFlowStep(value: string): FlowStepKind | null {
  return value === "trigger" || value === "action" ? value : null;
}

type AddStepResult =
  | { nodes: NodeType[]; edges: EdgeType[]; nodeId: string }
  | { error: string };

// Keep palette additions in the same sequence used by saveZap, while retaining
// the canvas coordinates chosen by the user.
export function addStepAtPosition(
  nodes: NodeType[],
  edges: EdgeType[],
  kind: FlowStepKind,
  position: XYPosition,
  subscription: string,
  newNodeId: string,
): AddStepResult {
  const trigger = nodes.find((node) => !node.data.action);
  if (kind === "trigger" && trigger?.data.configured) {
    return {
      error: "Each workflow has one trigger. Select it to change its setup.",
    };
  }
  if (kind === "action" && !trigger) {
    return { error: "Add a trigger before adding an action." };
  }

  // New workflows already contain empty slots. Fill those before adding steps.
  const placeholder = nodes.find(
    (node) =>
      node.data.action === (kind === "action") &&
      !node.data.configured &&
      !node.data.id,
  );
  if (placeholder) {
    return {
      nodes: nodes.map((node) =>
        node.id === placeholder.id ? { ...node, position } : node,
      ),
      edges,
      nodeId: placeholder.id,
    };
  }

  if (kind === "trigger" && trigger) {
    return {
      error: "Each workflow has one trigger. Select it to finish its setup.",
    };
  }
  if (subscription === "free" && nodes.length > 3) {
    return { error: "Free plan allows up to 3 actions. Upgrade to add more." };
  }

  const orderedNodes: NodeType[] = [];
  const visited = new Set<string>();
  let current = trigger;
  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    orderedNodes.push(current);
    const outgoing = edges.filter((edge) => edge.source === current!.id);
    if (outgoing.length > 1) break;
    current = nodes.find((node) => node.id === outgoing[0]?.target);
  }

  if (
    visited.size !== nodes.length ||
    edges.length !== Math.max(0, nodes.length - 1) ||
    current
  ) {
    return {
      error: "Connect all steps in a single sequence before adding an action.",
    };
  }

  const newNode: NodeType = {
    id: newNodeId,
    type: "customNode",
    position,
    data: {
      name: kind === "trigger" ? "Trigger" : "Action",
      image: "",
      configured: false,
      action: kind === "action",
      metadata: {},
    },
  };
  const tail = orderedNodes.at(-1);

  return {
    nodes: [...orderedNodes, newNode],
    edges: tail
      ? [
          ...edges,
          {
            id: `e${tail.id}-${newNodeId}`,
            type: "buttonEdge",
            source: tail.id,
            target: newNodeId,
          },
        ]
      : edges,
    nodeId: newNodeId,
  };
}
