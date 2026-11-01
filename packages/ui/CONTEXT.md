# Agent Contract: Shared UI Library (Layer 2)

## 🎯 Purpose

Provides a shared component system containing styling primitives, navigation layout wrappers, and custom interactive builder blocks.

---

## 📥 Inputs

- React components configuration.
- Tailwind CSS utility styling definitions.

---

## ⚙️ Process

1. **Component Design**: Build UI components using Tailwind styling guidelines and Radix UI components.
2. **Export Patterns**: Export components through standard packaging configs for import inside Next.js.
3. **Compilation**: Built automatically during turbo pipelines.

---

## 📤 Outputs

- Reusable components imported by [`apps/frontend`](../../apps/frontend).
