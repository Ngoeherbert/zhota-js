# LumineJS

LumineJS is a full-stack JSX framework with built-in widgets, file-system routing, SSR/SSG/ISR/CSR rendering strategies, API routes, server actions, and automatic optimizations.

## Monorepo layout

```text
packages/
  core/         JSX runtime, reactivity, and hooks
  widgets/      Built-in UI widgets
  router/       File-system router for client and server
  server/       SSR, SSG, ISR, CSR, API routes, and server actions
  compiler/     Build-time compiler and optimizer
  image/        Image and font optimization
  cli/          lumine command-line interface
  vite-plugin/  Vite integration
apps/
  website/      Official documentation and marketing site
  demo/         Demo full-stack application
```

## Scripts

- `pnpm build` — build all packages in dependency order with Turborepo.
- `pnpm dev` — run package/app development tasks in watch mode.
- `pnpm test` — run tests across the workspace.
- `pnpm lint` — lint all packages and apps.
- `pnpm typecheck` — run TypeScript checks across the workspace.


## Implemented framework surface

This repository now contains first-pass implementations for the core runtime, JSX renderer, hooks, file-system routing, rendering engine, API routes, server actions, compiler transforms, image/font helpers, CLI command dispatcher, theme tokens, and the built-in widget catalog. The code is intentionally package-local and dependency-light so the workspace can typecheck even before the full dependency install is available.

The demo and website apps include Vite entrypoints and browser-rendered pages, so running their `dev` scripts serves visible application content instead of placeholder modules.

Future tasks can deepen each subsystem with production-grade behavior, but the monorepo is no longer a placeholder-only scaffold: every package exposes concrete public APIs that match the LumineJS roadmap.


