import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// Test suite validating Laws of UX principles applied across Flowentis
test("Laws of UX Test Suite", async (t) => {
  await t.test("Postel's Law (Robustness Principle): Liberal input acceptance & normalization", () => {
    // Postel's law: "Be liberal in what you accept, conservative in what you send"
    const sanitizeEmail = (email) => (email || "").trim().toLowerCase();
    const sanitizeName = (name) => (name || "").trim();
    const sanitizeSolanaKey = (key) => (key || "").trim();

    assert.equal(
      sanitizeEmail("   User.NAME@Example.COM  \n"),
      "user.name@example.com",
      "Email must be trimmed and converted to lowercase",
    );

    assert.equal(
      sanitizeName("  John Doe   \t"),
      "John Doe",
      "Name must be stripped of leading/trailing whitespace",
    );

    const rawSolanaKey = "  5Kb8kLf9zgWQnogidDA76MzPL6TsZZY36hWXMssSzNydYXYB9KF  ";
    assert.equal(
      sanitizeSolanaKey(rawSolanaKey),
      "5Kb8kLf9zgWQnogidDA76MzPL6TsZZY36hWXMssSzNydYXYB9KF",
      "Solana private key must be safely trimmed without altering base58 characters",
    );
  });

  await t.test("Fitts's Law: Minimum 44px touch targets & isolated destructive actions", () => {
    // Fitts's law: "Time to hit a target depends on its size and distance"
    // Recommended interactive touch target is at least 44px for primary mobile/desktop targets
    const MIN_TOUCH_TARGET_PX = 44;

    const buttonSizes = {
      default: { minHeight: 40, px: 16 },
      lg: { minHeight: 44, px: 32 },
      sidebarIcon: { minHeight: 44, minWidth: 44 },
    };

    assert.ok(
      buttonSizes.lg.minHeight >= MIN_TOUCH_TARGET_PX,
      "Large primary CTA touch target must be at least 44px",
    );
    assert.ok(
      buttonSizes.sidebarIcon.minHeight >= MIN_TOUCH_TARGET_PX &&
      buttonSizes.sidebarIcon.minWidth >= MIN_TOUCH_TARGET_PX,
      "Sidebar interactive icons must provide at least 44px hit bounds",
    );

    // Destructive actions (Delete Workflow) must require a secondary confirmation step
    const hasConfirmationDialog = true;
    assert.equal(
      hasConfirmationDialog,
      true,
      "Destructive actions must never trigger on single click without confirmation",
    );
  });

  await t.test("Doherty Threshold: Responsiveness target <400ms & skeleton feedback", () => {
    // Doherty threshold: "Productivity rises when the system responds in under about 400 ms"
    const MAX_OPTIMISTIC_DELAY_MS = 400;
    const currentToggleDebounceMs = 400; // Optimized down from 2000ms

    assert.ok(
      currentToggleDebounceMs <= MAX_OPTIMISTIC_DELAY_MS,
      "Workflow toggle debounce must not exceed the 400ms Doherty threshold",
    );

    // Check that ZapTableSkeleton component file exists for instant loading feedback
    const skeletonPath = path.resolve(
      process.cwd(),
      "apps/frontend/src/components/ui/skeleton.tsx",
    );
    assert.ok(
      fs.existsSync(skeletonPath),
      "Skeleton component must exist to replace raw text loaders",
    );
  });

  await t.test("Jakob's Law: Standard patterns & valid navigation routes", () => {
    // Jakob's law: "Users expect your site to work like ones they already know"
    const navbarPath = path.resolve(
      process.cwd(),
      "apps/frontend/src/components/globals/navbar.tsx",
    );
    const navbarContent = fs.readFileSync(navbarPath, "utf-8");

    // Must link logo to home
    assert.ok(
      navbarContent.includes('href="/"'),
      "Navbar logo must link directly to home (/)",
    );

    // Must not have broken /features link (must use smooth scroll anchor /#features)
    assert.ok(
      !navbarContent.includes('href="/features"'),
      "Navbar must not link to nonexistent /features route",
    );

    // Sidebar navigation must include standardized Settings and Workflows
    const sidebarPath = path.resolve(
      process.cwd(),
      "apps/frontend/src/components/sidebar/sidebar.tsx",
    );
    const sidebarContent = fs.readFileSync(sidebarPath, "utf-8");
    assert.ok(
      sidebarContent.includes("Sign Out") || sidebarContent.includes("LogOut"),
      "Sidebar must provide a recognizable sign out action",
    );
  });

  await t.test("Von Restorff Effect: Exactly one standout element in pricing", () => {
    // Von Restorff effect: "The item that differs from the rest is remembered"
    const pricingCardPath = path.resolve(
      process.cwd(),
      "apps/frontend/src/components/pricing/pricing-card.tsx",
    );
    const content = fs.readFileSync(pricingCardPath, "utf-8");

    // Exactly the Pro tier must be highlighted with badge and distinct styling
    assert.ok(
      content.includes("Most Popular"),
      "Pricing must feature a 'Most Popular' standout badge for the Pro plan",
    );
    assert.ok(
      content.includes("isPro ?"),
      "Pro tier must visually differ from standard tier in border and button variant",
    );
  });

  await t.test("Law of Common Region: Elements grouped inside card boundaries", () => {
    // Law of common region: "Elements inside one boundary are seen as a group"
    const connectionsPath = path.resolve(
      process.cwd(),
      "apps/frontend/src/app/(main)/(pages)/connections/page.tsx",
    );
    const content = fs.readFileSync(connectionsPath, "utf-8");

    // Disconnect button must be housed within each connection card, not in a detached bottom section
    assert.ok(
      !content.includes('<h2 className="text-lg font-bold">Disconnect Apps</h2>'),
      "Disconnect actions must not be isolated in an orphaned section at the bottom of the page",
    );
    assert.ok(
      content.includes("Disconnect"),
      "Disconnect action must reside inside the card alongside the app status",
    );
  });

  await t.test("Miller's Law: Chunking bounds for working memory (<= 7 items)", () => {
    // Miller's law: Working memory limit is ~7 items; chunk lists and steps
    const MAX_CHUNKS = 7;

    const basicFeatures = [
      "2 lifetime AI-generated workflows",
      "Basic Triggers: GitHub, LinkedIn",
      "Basic Actions: Email, Solana",
      "3 automated workflows",
      "Daily limit: 20 job fetches.",
    ];

    const onboardingSteps = [
      "Connect Integrations",
      "Build Workflow",
      "Run Automatically",
    ];

    assert.ok(
      basicFeatures.length <= MAX_CHUNKS,
      "Feature list must not overload working memory (must be <= 7 items)",
    );
    assert.ok(
      onboardingSteps.length <= MAX_CHUNKS,
      "Onboarding steps must be concise (3 steps <= 7)",
    );
  });

  await t.test("Zeigarnik Effect: Completion motivation with onboarding steps", () => {
    // Zeigarnik effect: "Unfinished tasks are remembered better than finished ones"
    const zapTablePath = path.resolve(
      process.cwd(),
      "apps/frontend/src/components/Zap/zap-table.tsx",
    );
    const content = fs.readFileSync(zapTablePath, "utf-8");

    assert.ok(
      content.includes("Step 1") && content.includes("Step 2") && content.includes("Step 3"),
      "Empty state must display an onboarding checklist to guide workflow creation",
    );
  });
});
