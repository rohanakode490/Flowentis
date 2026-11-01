"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/globals/heading";
import { googleLogout } from "@react-oauth/google";
import Image from "next/image";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import useStore from "@/lib/store";
import api from "@/lib/api";
import { AlertTriangle, CheckCircle2, ShieldCheck, Unlink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

declare global {
  interface Window {
    google: any;
    gapi: any;
    googleCodeClient: any;
  }
}

interface ConnectionItem {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
}

const CONNECTIONS: ConnectionItem[] = [
  {
    id: "google-sheets",
    title: "Google Sheets",
    category: "Productivity & Data",
    description:
      "Connect your Google account to automatically read rows and append new workflow records.",
    image:
      "https://res.cloudinary.com/dmextegpu/image/upload/v1753959054/Google_Sheets_Logo_512px_gtxhsx.png",
  },
  {
    id: "solana",
    title: "Solana",
    category: "Web3 & Blockchain",
    description:
      "Securely connect your Solana key to automate automated on-chain transfers and actions.",
    image:
      "https://res.cloudinary.com/dmextegpu/image/upload/v1741162444/solana-sol-logo_fshz8v.png",
  },
];

const Connections: React.FC = () => {
  const [connections, setConnections] = useState<Record<string, boolean>>({
    "Google Sheets": false,
    Solana: false,
  });
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSolanaModalOpen, setIsSolanaModalOpen] = useState(false);
  const [solanaPrivateKey, setSolanaPrivateKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    user: { setRefreshToken },
    ui: { addToast },
  } = useStore();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const checkConnections = async () => {
      try {
        const resp = await api.get("/user");
        if (mounted) {
          setConnections({
            "Google Sheets": !!resp.data.user.googleRefreshToken,
            Solana: !!resp.data.user.solanaPrivateKey,
          });
        }
      } catch (e) {
        console.error("Failed to fetch user connections", e);
      } finally {
        if (mounted) setIsFetching(false);
      }
    };

    const waitForGoogle = async () => {
      if (!mounted) return;
      if (typeof window === "undefined") return;
      if (!window.google || !window.gapi) {
        setTimeout(waitForGoogle, 200);
        return;
      }

      try {
        await new Promise<void>((resolve) =>
          window.gapi.load("client", resolve),
        );
        await window.gapi.client.init({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
          discoveryDocs: [
            "https://sheets.googleapis.com/$discovery/rest?version=v4",
          ],
        });
      } catch (e) {
        console.warn("gapi init failed", e);
      }

      window.googleCodeClient = window.google.accounts.oauth2.initCodeClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        scope:
          "https://www.googleapis.com/auth/drive.file openid email profile",
        ux_mode: "popup",
        redirect_uri: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/callback`,
        callback: async (resp: any) => {
          if (!resp || !resp.code) {
            setError("No authorization code received from Google");
            addToast("Google authorization cancelled", "error");
            return;
          }
          try {
            const token = localStorage.getItem("token");
            const response = await api.post(
              `/sheets`,
              { code: resp.code },
              { headers: { Authorization: `Bearer ${token}` } },
            );
            setRefreshToken(response.data.refresh_token || "");
            setConnections((prev) => ({ ...prev, "Google Sheets": true }));
            setError(null);
            addToast("Google Sheets successfully connected!", "success");
            router.push("/workflows");
          } catch (err) {
            console.error("Token exchange error:", err);
            setError("Failed to authenticate with Google Sheets");
            addToast("Failed to authenticate with Google Sheets", "error");
          }
        },
      });
    };

    checkConnections();
    waitForGoogle();

    return () => {
      mounted = false;
    };
  }, [setRefreshToken, router, addToast]);

  const handleSolanaConnect = async () => {
    // Postel's law: Clean whitespace
    const cleanKey = solanaPrivateKey.trim();
    if (!cleanKey) return;

    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      await api.post(
        `/user/solana-key`,
        { privateKey: cleanKey },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setConnections((prev) => ({ ...prev, Solana: true }));
      setIsSolanaModalOpen(false);
      setSolanaPrivateKey("");
      addToast("Solana wallet successfully connected!", "success");
    } catch (err) {
      setError("Failed to save Solana private key. Please check the key and try again.");
      addToast("Failed to save Solana key", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = (type: string) => {
    if (type === "Google Sheets") {
      googleLogout();
      setRefreshToken("");
    }
    setConnections((prev) => ({ ...prev, [type]: false }));
    addToast(`${type} disconnected`, "success");
  };

  return (
    <div className="relative flex flex-col gap-6 p-4 md:p-6 max-w-5xl">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Connected Applications
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your third-party integrations and credentials. Connected apps allow Flowentis to execute actions on your behalf.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Law of Common Region: All metadata and controls for each integration reside within that integration's card */}
      <div className="grid gap-4">
        {isFetching ? (
          <div className="space-y-4">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        ) : (
          CONNECTIONS.map((connection) => {
            const isConnected = !!connections[connection.title];
            return (
              <Card
                key={connection.title}
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gap-4 transition-all border ${
                  isConnected
                    ? "border-primary/30 bg-card shadow-sm"
                    : "border-border bg-card/60"
                }`}
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="h-12 w-12 rounded-xl p-2 border border-border bg-background flex items-center justify-center shrink-0 shadow-xs">
                    <Image
                      src={connection.image}
                      alt={connection.title}
                      height={32}
                      width={32}
                      className="object-contain"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground text-base">
                        {connection.title}
                      </h3>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                        {connection.category}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {connection.description}
                    </p>
                  </div>
                </div>

                {/* Law of Common Region & Proximity: Actions grouped directly with the card */}
                <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                  {isConnected ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Connected
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDisconnect(connection.title)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs h-9"
                      >
                        <Unlink className="h-3.5 w-3.5 mr-1" />
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      className="font-medium text-xs px-4 h-9 shadow-xs"
                      onClick={() => {
                        if (connection.title === "Solana") {
                          setIsSolanaModalOpen(true);
                        } else if (window.googleCodeClient) {
                          window.googleCodeClient.requestCode();
                        } else {
                          setError("Google authentication service is initializing. Please retry in a moment.");
                        }
                      }}
                    >
                      Connect
                    </Button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Solana Connection Modal */}
      <Dialog open={isSolanaModalOpen} onOpenChange={setIsSolanaModalOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Image
                src="https://res.cloudinary.com/dmextegpu/image/upload/v1741162444/solana-sol-logo_fshz8v.png"
                alt="Solana"
                height={22}
                width={22}
              />
              Connect Solana Wallet
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-2 text-left">
              <div className="flex gap-2.5 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed font-normal">
                  <strong>Notice:</strong> This integration is currently in preview. We recommend testing with development or low-balance wallets.
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Your private key will be encrypted on the server using AES-256-GCM before being stored.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2 text-left">
            <Label htmlFor="privateKey" className="text-xs font-semibold">
              Private Key (Base58)
            </Label>
            <Input
              id="privateKey"
              type="password"
              placeholder="Enter Base58 private key..."
              value={solanaPrivateKey}
              onChange={(e) => setSolanaPrivateKey(e.target.value)}
              className="text-sm font-mono h-10"
              autoComplete="off"
            />
            <p className="text-[11px] text-muted-foreground">
              Example format: 5K... (Keep your private keys strictly confidential)
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSolanaModalOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSolanaConnect}
              disabled={!solanaPrivateKey.trim() || isLoading}
              isLoading={isLoading}
            >
              Securely Save Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default function ConnectionsPage() {
  return (
    <Header heading="Connections">
      <Connections />
    </Header>
  );
}
