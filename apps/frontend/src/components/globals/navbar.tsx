"use client";

import Link from "next/link";
import React from "react";
import { links } from "@/lib/constant";
import { MobileNav } from "./mobile-nav-menu";
import { ModeToggle } from "./mode-toggle";
import { Sparkles } from "lucide-react";

type Props = {
  OnlyLogo?: boolean;
};

const Navbar = ({ OnlyLogo = false }: Props) => {
  return (
    // Jakob's Law: Standard header layout with logo on top left, nav center, actions right
    <header className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 py-3.5 bg-background/70 backdrop-blur-xl border-b border-border shadow-xs">
      {/* Logo Section */}
      <aside className="flex items-center">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-xl md:text-2xl text-foreground hover:opacity-90 transition-opacity"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <span>Flowentis</span>
        </Link>
      </aside>

      {!OnlyLogo && (
        <>
          {/* Desktop Navigation Menu (Serial Position Effect: key pages organized) */}
          <nav className="hidden md:block">
            <ul className="flex items-center gap-8 text-sm font-medium text-foreground">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors py-2"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right Section: Theme Toggle, Sign In, Primary CTA */}
          {/* Fitts's Law: Adequate touch target and clear primary vs secondary */}
          <aside className="flex items-center gap-3">
            <ModeToggle />

            <Link
              href="/login"
              className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 transition-colors"
            >
              Sign In
            </Link>

            {/* Von Restorff effect: Primary CTA stands out */}
            <Link
              href="/workflows"
              className="relative inline-flex h-10 overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            >
              <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,var(--primary)_0%,var(--secondary)_50%,var(--primary)_100%)]" />
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-background px-4 py-1.5 text-sm font-semibold text-foreground backdrop-blur-3xl hover:bg-background/80 transition-colors">
                Get Started
              </span>
            </Link>

            <MobileNav />
          </aside>
        </>
      )}
    </header>
  );
};

export default Navbar;
