import React, { useCallback, useEffect, useState } from "react";
import { ChevronRight, Trash2, ArrowRight, Play, Pause, Sparkles } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { Zap } from "@/lib/types";
import { Button } from "../ui/button";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { ConfirmationDialog } from "./Confirmation-Dialog";
import useStore from "@/lib/store";
import { debounce } from "lodash";
import { Skeleton } from "@/components/ui/skeleton";

export function ZapTableSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 border rounded-lg border-border/50">
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-12 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ZapTable({ zaps }: { zaps: Zap[] }) {
  const [zapToDelete, setZapToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localZapStatus, setLocalZapStatus] = useState<Record<string, boolean>>(
    zaps.reduce((acc, zap) => ({ ...acc, [zap.id]: zap.isActive }), {}),
  );
  const {
    zap: { toggleZap, zapStatus },
    ui: { addToast },
  } = useStore();

  // Sync localZapStatus with zapStatus when zapStatus changes
  useEffect(() => {
    setLocalZapStatus((prev) =>
      zaps.reduce(
        (acc, zap) => ({
          ...acc,
          [zap.id]: zapStatus[zap.id] ?? zap.isActive,
        }),
        prev,
      ),
    );
  }, [zapStatus, zaps]);

  // Function to handle Zap toggle
  const handleToggleZap = useCallback(
    async (zapId: string, isActive: boolean) => {
      try {
        await toggleZap(zapId, isActive);
        addToast(
          isActive ? "Workflow activated" : "Workflow paused",
          "success",
        );
      } catch (error) {
        console.error("Failed to toggle Zap:", error);
        setLocalZapStatus((prev) => ({ ...prev, [zapId]: !isActive })); // Revert on failure
        addToast("Failed to toggle workflow status.", "error");
      }
    },
    [toggleZap, addToast],
  );

  // Debounced toggle handler for rapid clicks
  const debouncedToggleZap = useCallback(
    debounce(
      (zapId: string, isActive: boolean) => {
        handleToggleZap(zapId, isActive);
      },
      400,
      { leading: false, trailing: true },
    ),
    [handleToggleZap],
  );

  // Handle switch toggle with instant local state update (Doherty threshold)
  const handleSwitchToggle = (zapId: string, checked: boolean) => {
    setLocalZapStatus((prev) => ({ ...prev, [zapId]: checked }));
    debouncedToggleZap(zapId, checked);
  };

  // Function to handle Zap deletion
  const handleDeleteZap = async (zapId: string) => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await api.delete(`/zap/${zapId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        toast.success("Workflow deleted successfully!");
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        toast.error("Failed to delete workflow. Please try again.");
      }
    } catch (error) {
      console.error("Failed to delete Zap:", error);
      toast.error("Failed to delete workflow. Please try again.");
    } finally {
      setIsDeleting(false);
      setZapToDelete(null);
    }
  };

  // Zeigarnik effect & Aesthetic-usability: Empty state with guided next steps
  if (!zaps || zaps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center animate-in fade-in-50">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 shadow-inner">
          <Sparkles className="h-8 w-8 animate-pulse" />
        </div>
        <h3 className="text-xl font-bold text-foreground">No workflows created yet</h3>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Automate your repetitive work by connecting your favorite triggers (GitHub, LinkedIn) to actions (Email, Google Sheets, Solana).
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button asChild size="lg" className="gap-2">
            <Link href="/flow/create">
              <Sparkles className="h-4 w-4" />
              Create First Workflow
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/connections">
              Connect Services
            </Link>
          </Button>
        </div>

        {/* Zeigarnik effect: Onboarding checklist */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left w-full max-w-2xl border-t border-border/60 pt-6">
          <div className="p-3 rounded-lg bg-card border border-border/50">
            <span className="text-xs font-semibold text-primary">Step 1</span>
            <p className="text-sm font-medium text-foreground mt-1">Connect Integrations</p>
            <p className="text-xs text-muted-foreground mt-0.5">Authorize Google Sheets or Solana.</p>
          </div>
          <div className="p-3 rounded-lg bg-card border border-border/50">
            <span className="text-xs font-semibold text-primary">Step 2</span>
            <p className="text-sm font-medium text-foreground mt-1">Build Workflow</p>
            <p className="text-xs text-muted-foreground mt-0.5">Visually connect trigger to actions.</p>
          </div>
          <div className="p-3 rounded-lg bg-card border border-border/50">
            <span className="text-xs font-semibold text-primary">Step 3</span>
            <p className="text-sm font-medium text-foreground mt-1">Run Automatically</p>
            <p className="text-xs text-muted-foreground mt-0.5">Toggle active and let Flowentis run.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-border bg-muted/40">
            <TableHead className="w-[45%] font-semibold">Workflow Flow</TableHead>
            <TableHead className="font-semibold">Apps</TableHead>
            <TableHead className="font-semibold">Created</TableHead>
            <TableHead className="font-semibold text-center">Status</TableHead>
            <TableHead className="text-right font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {zaps.map((zap) => {
            const isRunning = localZapStatus[zap.id] ?? zap.isActive;
            return (
              <TableRow
                key={zap.id}
                className="hover:bg-accent/40 transition-colors border-b border-border/60"
              >
                {/* Law of uniform connectedness: Connected visual representation */}
                <TableCell className="font-medium">
                  <Link
                    href={`/flow/edit/${zap.id}`}
                    className="group flex items-center gap-2 text-foreground hover:text-primary transition-colors"
                  >
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                      {zap.trigger.type.name}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                    {zap.actions.map((action, index) => (
                      <React.Fragment key={action.id || index}>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                          {action.type.name}
                        </span>
                        {index < zap.actions.length - 1 && (
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </React.Fragment>
                    ))}
                  </Link>
                </TableCell>

                {/* Law of Prägnanz & Proximity: Clear recognizable app icons */}
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    {zap.trigger.type.image && (
                      <div className="h-7 w-7 rounded-md p-1 border border-border bg-background flex items-center justify-center shadow-2xs">
                        <img
                          src={zap.trigger.type.image}
                          alt={zap.trigger.type.name}
                          className="h-5 w-5 object-contain"
                        />
                      </div>
                    )}
                    {zap.actions.map((action) => (
                      action.type.image ? (
                        <div
                          key={action.id}
                          className="h-7 w-7 rounded-md p-1 border border-border bg-background flex items-center justify-center shadow-2xs"
                        >
                          <img
                            src={action.type.image}
                            alt={action.type.name}
                            className="h-5 w-5 object-contain"
                          />
                        </div>
                      ) : null
                    ))}
                  </div>
                </TableCell>

                {/* Formatted Date */}
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(zap.createdAt).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>

                {/* Status Switch with clear visual state */}
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                        isRunning
                          ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isRunning ? "bg-green-500 animate-pulse" : "bg-muted-foreground"
                        }`}
                      />
                      {isRunning ? "Active" : "Paused"}
                    </span>
                    <Switch
                      checked={isRunning}
                      aria-label="Toggle workflow active state"
                      onCheckedChange={(checked) =>
                        handleSwitchToggle(zap.id, checked)
                      }
                    />
                  </div>
                </TableCell>

                {/* Fitts's Law: Accessible minimum 44px hit targets + distinct actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="h-9 px-3 text-muted-foreground hover:text-foreground"
                    >
                      <Link href={`/flow/edit/${zap.id}`} className="flex items-center gap-1">
                        Edit
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      onClick={() => setZapToDelete(zap.id)}
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Delete workflow"
                      aria-label="Delete workflow"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Confirmation Dialog */}
      {zapToDelete && (
        <ConfirmationDialog
          isOpen={!!zapToDelete}
          onClose={() => setZapToDelete(null)}
          onConfirm={() => handleDeleteZap(zapToDelete)}
          title="Delete Workflow"
          message="Are you sure you want to delete this workflow? This action cannot be undone and any pending automation tasks will be cancelled."
        />
      )}
    </div>
  );
}
