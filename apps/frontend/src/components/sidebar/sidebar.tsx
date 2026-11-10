"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { menuOptions } from "@/lib/constant";
import clsx from "clsx";
import { ModeToggle } from "@/components/globals/mode-toggle";
import { LogOut, BookOpen, Sparkles } from "lucide-react";
import useStore from "@/lib/store";

export default function Sidebar() {
  const pathName = usePathname();
  const router = useRouter();
  const {
    ui: { addToast },
  } = useStore();

  const handleLogout = () => {
    localStorage.removeItem("token");
    addToast("Logged out successfully", "success");
    router.push("/login");
  };

  return (
    // Fitts's Law & Law of Common Region: Fixed width sidebar with accessible 44px hit targets
    <aside className="bg-card/40 backdrop-blur-md h-screen w-16 md:w-20 justify-between flex items-center flex-col py-6 px-2 border-r border-border shrink-0 select-none">
      <div className="flex items-center justify-center flex-col gap-8 w-full">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200"
          title="Flowentis Home"
          aria-label="Flowentis Home"
        >
          <Sparkles className="h-6 w-6" />
        </Link>

        {/* Navigation list */}
        {/* Serial position effect: Primary workflow tools listed first */}
        <TooltipProvider delayDuration={100}>
          <nav className="flex flex-col items-center gap-3 w-full" aria-label="Main Navigation">
            {menuOptions.map((menuItem) => {
              const isActive = pathName === menuItem.href;
              return (
                <Tooltip key={menuItem.name}>
                  <TooltipTrigger asChild>
                    <Link
                      href={menuItem.href}
                      aria-label={menuItem.name}
                      className={clsx(
                        "relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200",
                        {
                          "bg-primary text-primary-foreground shadow-md shadow-primary/25 font-semibold":
                            isActive,
                          "text-muted-foreground hover:bg-accent hover:text-foreground":
                            !isActive,
                        },
                      )}
                    >
                      <menuItem.Component selected={isActive} />
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2.5 h-6 w-1 rounded-r-full bg-primary" />
                      )}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="bg-popover text-popover-foreground border-border text-xs px-2.5 py-1 font-medium shadow-md"
                  >
                    {menuItem.name}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>
        </TooltipProvider>
      </div>

      {/* Bottom utilities: Theme, Docs & Logout (Serial Position Effect: utility & exit at end) */}
      <div className="flex items-center justify-center flex-col gap-3 w-full">
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/docs"
                className="flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                aria-label="Documentation"
              >
                <BookOpen className="h-5 w-5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              Documentation
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <ModeToggle />

        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className="flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                aria-label="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              Sign Out
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  );
}
