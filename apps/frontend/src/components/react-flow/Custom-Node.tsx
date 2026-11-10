import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Play, X, Zap } from "lucide-react";

interface NodeData {
  configured: boolean;
  onOpenDialog: () => void;
  action: boolean;
  canDelete: boolean;
  onDelete: (id: string) => void;
  image: string;
  name: string;
}

interface CustomNodeProps {
  id: string;
  data: NodeData;
}

const CustomNode = memo(({ data, id }: CustomNodeProps) => {
  return (
    <>
      <div className="w-48 h-20 rounded-md border-2 shadow-md flex items-center justify-around px-3 bg-card border-border">
        {/* Delete button */}
        {data.action && (
          <button
            type="button"
            aria-label={`Delete ${data.name}`}
            onClick={(e) => {
              e.stopPropagation();
              if (data.canDelete) {
                data.onDelete(id);
              } else {
                alert("At least 2 Flows needed");
              }
            }}
            className="nodrag nopan absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200 bg-destructive hover:bg-destructive/90"
          >
            <X className="w-4 h-4 text-destructive-foreground" />
          </button>
        )}

        {/* Left side: Logo */}
        <div className="rounded-full w-12 h-12 flex justify-center items-center bg-muted">
          {data.image ? (
            <img
              src={data.image}
              alt="Logo"
              draggable={false}
              className="w-8 h-8"
              style={{ display: "block" }}
            />
          ) : data.action ? (
            <Play className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Zap className="h-6 w-6" aria-hidden="true" />
          )}
        </div>

        {/* Right side: Name of the Zap */}
        <div className="text-sm font-medium truncate text-foreground">
          {data.name}
        </div>

        {/* Handles for connecting nodes */}
        {data.action && (
          <Handle
            type="target"
            position={Position.Top}
            className="w-12 bg-primary"
          />
        )}
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-12 bg-primary"
        />
      </div>
    </>
  );
});

export default memo(CustomNode);
