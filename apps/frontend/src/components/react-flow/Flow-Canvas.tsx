import React, { useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Node,
  Edge,
  ConnectionMode,
  useReactFlow,
  type XYPosition,
} from "@xyflow/react";
import CustomNode from "./Custom-Node";
import CustomEdge from "./Custom-Edge";
import { FlowPalette } from "./Flow-Palette";
import { VERTICAL_SPACING } from "./Flow-Helpers";
import {
  FLOW_STEP_MIME_TYPE,
  parseFlowStep,
  type FlowStepKind,
} from "./Flow-Drop";

const nodeTypes = {
  customNode: CustomNode,
};

const edgeTypes = {
  buttonEdge: CustomEdge,
};

interface FlowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: any) => void;
  onNodeClick: (event: any, node: any) => void;
  onAddStep: (kind: FlowStepKind, position: XYPosition) => void;
  isDarkMode: boolean;
}

export const FlowCanvas = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onAddStep,
  isDarkMode,
}: FlowCanvasProps) => {
  const { screenToFlowPosition, fitView } = useReactFlow();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleAddByClick = (kind: FlowStepKind) => {
    const placeholder = nodes.find(
      (node) =>
        node.data.action === (kind === "action") && !node.data.configured,
    );
    const lastNode = nodes[nodes.length - 1];
    const bounds = canvasRef.current?.getBoundingClientRect();
    const position =
      placeholder?.position ??
      (lastNode
        ? { x: lastNode.position.x, y: lastNode.position.y + VERTICAL_SPACING }
        : screenToFlowPosition({
            x: (bounds?.left ?? 0) + (bounds?.width ?? 0) / 2,
            y: (bounds?.top ?? 0) + (bounds?.height ?? 0) / 2,
          }));
    onAddStep(kind, position);
    requestAnimationFrame(() => fitView({ padding: 0.2, duration: 200 }));
  };

  return (
    <div
      className="flex min-w-0 flex-1 flex-col"
      onDragEnd={() => setIsDragOver(false)}
    >
      <FlowPalette
        onAddStep={handleAddByClick}
        hasConfiguredTrigger={nodes.some(
          (node) => !node.data.action && node.data.configured,
        )}
      />
      <div
        ref={canvasRef}
        aria-label="Workflow canvas"
        className="relative min-h-0 flex-1"
        onDragOver={(event) => {
          if (!event.dataTransfer.types.includes(FLOW_STEP_MIME_TYPE)) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
          setIsDragOver(true);
        }}
        onDragLeave={(event) => {
          if (
            !event.currentTarget.contains(
              event.relatedTarget as globalThis.Node | null,
            )
          ) {
            setIsDragOver(false);
          }
        }}
        onDrop={(event) => {
          setIsDragOver(false);
          if (!event.dataTransfer.types.includes(FLOW_STEP_MIME_TYPE)) return;
          event.preventDefault();
          const kind = parseFlowStep(
            event.dataTransfer.getData(FLOW_STEP_MIME_TYPE),
          );
          if (!kind) return;
          onAddStep(
            kind,
            screenToFlowPosition(
              { x: event.clientX, y: event.clientY },
              { snapToGrid: false },
            ),
          );
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          fitView
          maxZoom={1.5}
          connectionMode={ConnectionMode.Loose}
        >
          <Background
            color={isDarkMode ? "var(--border)" : "var(--muted)"}
            gap={16}
          />
        </ReactFlow>
        {isDragOver && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center rounded-md border-2 border-dashed border-primary bg-primary/5 pt-6">
            <span className="rounded-md bg-background px-3 py-2 text-sm font-medium shadow-sm">
              Drop to add a step
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
