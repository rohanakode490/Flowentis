"use client";

import React, { useEffect, Suspense } from "react";
import Heading from "@/components/globals/heading";
import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
import GetZaps from "@/components/Zap/get-zaps";
import ZapTable, { ZapTableSkeleton } from "@/components/Zap/zap-table";
import { useRouter, useSearchParams } from "next/navigation";
import useStore from "@/lib/store";

function WorkflowsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    user: { setRefreshToken },
    webhook: { fetchWebhooks },
  } = useStore();

  useEffect(() => {
    fetchWebhooks("trigger");
    fetchWebhooks("action");
  }, [fetchWebhooks]);

  useEffect(() => {
    const token = searchParams.get("token");
    const refresh_token = searchParams.get("refresh_token");
    if (refresh_token && typeof refresh_token === "string") {
      setRefreshToken(refresh_token);
    }
    if (token) {
      localStorage.setItem("token", token);
      router.replace("/workflows");
    }
  }, [searchParams, router, setRefreshToken]);

  const { loading, zaps } = GetZaps();

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Hick's Law & Von Restorff: Clear single primary action at top */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            All Automations
          </h2>
          <p className="text-sm text-muted-foreground">
            Monitor, toggle, and configure your active automated workflows
          </p>
        </div>
        <Button
          size="default"
          className="font-semibold gap-2 shadow-sm"
          onClick={() => {
            router.push("/flow/create");
          }}
        >
          <CirclePlus className="h-4 w-4" />
          Create Workflow
        </Button>
      </div>

      {/* Doherty Threshold: High responsiveness with polished skeleton loader */}
      <div className="w-full">
        {loading ? <ZapTableSkeleton /> : <ZapTable zaps={zaps} />}
      </div>
    </div>
  );
}

export default function WorkflowsPage() {
  return (
    <Heading heading="Workflows">
      <Suspense fallback={<div className="p-6"><ZapTableSkeleton /></div>}>
        <WorkflowsContent />
      </Suspense>
    </Heading>
  );
}
