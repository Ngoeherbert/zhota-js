# LemineJS

LemineJS is a full-stack JSX framework with built-in widgets, file-system routing, SSR/SSG/ISR/CSR rendering strategies, API routes, server actions, and automatic optimizations.

## Monorepo layout

```text
packages/
  core/         JSX runtime, reactivity, and hooks
  widgets/      Built-in UI widgets
  router/       File-system router for client and server
  server/       SSR, SSG, ISR, CSR, API routes, and server actions
  compiler/     Build-time compiler and optimizer
  image/        Image and font optimization
  cli/          lemine command-line interface
  vite-plugin/  Vite integration
apps/
  website/      Official documentation and marketing site
  demo/         Demo full-stack application
```

## Running the CLI locally

The `lemine` binary is provided by the `@leminejs/cli` package, but it is not automatically installed as a global shell command when you clone this monorepo. If your shell prints `lemine: command not found`, build the CLI and run it through pnpm:

```sh
pnpm --filter @leminejs/cli build
pnpm lemine --help
pnpm lemine create my-app --template blank --lang ts --no-install
```

If you specifically want to type `lemine create my-app` without the `pnpm` prefix while working from this checkout, pnpm must first have a global bin directory on your `PATH`. If `pnpm link --global` prints `ERR_PNPM_NO_GLOBAL_BIN_DIR`, run pnpm's setup command, restart your shell, then link the CLI package:

```sh
pnpm setup
exec $SHELL -l
pnpm --filter @leminejs/cli build
cd packages/cli
pnpm link --global
lemine --help
```

If you do not want to configure pnpm global binaries, keep using `pnpm lemine ...` from the repository root instead of the bare `lemine` command.

## Scripts

- `pnpm build` — build all packages in dependency order with Turborepo.
- `pnpm dev` — run package/app development tasks in watch mode.
- `pnpm test` — run tests across the workspace.
- `pnpm lint` — lint all packages and apps.
- `pnpm typecheck` — run TypeScript checks across the workspace.

## Implemented framework surface

This repository now contains first-pass implementations for the core runtime, JSX renderer, hooks, file-system routing, rendering engine, API routes, server actions, compiler transforms, image/font helpers, CLI command dispatcher, theme tokens, and the built-in widget catalog. The code is intentionally package-local and dependency-light so the workspace can typecheck even before the full dependency install is available.

The demo and website apps include Vite entrypoints and browser-rendered pages, so running their `dev` scripts serves visible application content instead of placeholder modules.
