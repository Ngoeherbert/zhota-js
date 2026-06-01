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
