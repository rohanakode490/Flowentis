import { GripVertical, Play, Zap } from "lucide-react";
import { FLOW_STEP_MIME_TYPE, type FlowStepKind } from "./Flow-Drop";

interface FlowPaletteProps {
  onAddStep: (kind: FlowStepKind) => void;
  hasConfiguredTrigger: boolean;
}

export function FlowPalette({
  onAddStep,
  hasConfiguredTrigger,
}: FlowPaletteProps) {
  return (
    <aside
      aria-label="Workflow steps"
      className="flex shrink-0 flex-wrap items-center gap-3 border-b bg-card p-3"
    >
      <div className="mr-2">
        <h2 className="text-sm font-semibold">Add a step</h2>
        <p className="text-xs text-muted-foreground">
          Drag onto the canvas or click to add. New actions run last.
        </p>
      </div>
      {(["trigger", "action"] as const).map((kind) => {
        const disabled = kind === "trigger" && hasConfiguredTrigger;
        const Icon = kind === "trigger" ? Zap : Play;
        const label = kind === "trigger" ? "Trigger" : "Action";

        return (
          <button
            key={kind}
            type="button"
            draggable={!disabled}
            disabled={disabled}
            aria-label={`Add ${kind}`}
            title={
              disabled
                ? "Select the existing trigger to change it"
                : `Drag or click to add ${kind}`
            }
            onDragStart={(event) => {
              event.dataTransfer.setData(FLOW_STEP_MIME_TYPE, kind);
              event.dataTransfer.effectAllowed = "copy";
            }}
            onClick={() => onAddStep(kind)}
            className="flex cursor-grab items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
          >
            <GripVertical
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </button>
        );
      })}
    </aside>
  );
}
