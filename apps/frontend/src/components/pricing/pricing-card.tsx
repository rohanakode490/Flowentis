"use client";

import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { PricingPlan } from "./pricing-component";
import api from "@/lib/api";
import useStore from "@/lib/store";
import { useState } from "react";

interface PricingCardProps {
  plan: PricingPlan;
}

export const PricingCard = ({ plan }: PricingCardProps) => {
  const router = useRouter();
  const {
    ui: { addToast },
  } = useStore();

  const [isLoading, setIsLoading] = useState(false);
  const isPro = plan.name.toLowerCase() === "pro";

  const handleSubscription = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // If not logged in, prompt user to login first
        addToast("Please log in to choose a subscription plan", "error");
        router.push("/login");
        return;
      }

      const response = await api.post(
        "/subscription",
        {
          planName: plan.name,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = response.data;

      if (data.paymentLink) {
        window.location.href = data.paymentLink; // Redirect to checkout
      } else if (data.success) {
        addToast(`Switched to ${plan.name} plan!`, "success");
        router.push("/workflows");
      } else {
        throw new Error("Payment link is currently unavailable");
      }
    } catch (error: any) {
      console.error("Payment Error: ", error);
      addToast(
        error.response?.data?.error || error.message || "Failed to process plan. Please try again.",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Von Restorff effect: Distinguish Pro tier visually with badge, border, and elevated styling
    <div
      className={`relative flex flex-col justify-between rounded-2xl p-8 transition-all duration-300 ${
        isPro
          ? "border-2 border-primary bg-card/90 shadow-xl shadow-primary/10 ring-1 ring-primary/20 scale-[1.02]"
          : "border border-border bg-card/50 hover:border-border/80 shadow-sm"
      }`}
    >
      {isPro && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-md">
            <Sparkles className="h-3.5 w-3.5" />
            Most Popular
          </span>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
        </div>

        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-4xl font-extrabold tracking-tight text-foreground">
            {plan.price === 0 ? "Free" : `$${(plan.price / 100).toFixed(0)}`}
          </span>
          {plan.interval && (
            <span className="text-sm font-medium text-muted-foreground">
              /{plan.interval}
            </span>
          )}
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          {plan.price === 0
            ? "Perfect for exploring and creating basic automations."
            : "For power users who need high-throughput job scrapers and unlimited AI."}
        </p>

        {/* Miller's Law: Chunked, easily scannable list of key features */}
        <div className="mt-6 border-t border-border/60 pt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            What&apos;s included
          </p>
          <ul className="space-y-3">
            {plan.features.map((feature: string) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground">
                <div className="rounded-full bg-primary/10 p-0.5 mt-0.5 shrink-0 text-primary">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Doherty threshold & Fitts's law: Standout primary button with loading spinner */}
      <div className="mt-8 pt-4">
        <Button
          onClick={handleSubscription}
          variant={isPro ? "default" : "outline"}
          size="lg"
          className={`w-full font-semibold transition-all ${
            isPro ? "shadow-md shadow-primary/25" : ""
          }`}
          isLoading={isLoading}
        >
          {plan.price === 0 ? "Get Started Free" : "Upgrade to Pro"}
        </Button>
      </div>
    </div>
  );
};
