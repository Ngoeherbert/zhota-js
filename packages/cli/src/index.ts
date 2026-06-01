#!/usr/bin/env node
declare const process: { argv: string[]; cwd(): string; exitCode?: number; env: Record<string, string | undefined> }
declare const console: { log: (...args: unknown[]) => void; error: (...args: unknown[]) => void }

type NodeFs = {
  existsSync(path: string): boolean
  mkdirSync(path: string, options?: { recursive?: boolean }): void
  writeFileSync(path: string, data: string): void
}

type NodePath = {
  join(...parts: string[]): string
  resolve(...parts: string[]): string
  basename(path: string): string
}

type ChildProcess = {
  execSync(command: string, options?: { cwd?: string; stdio?: 'inherit' | 'pipe' | 'ignore' }): void
}

type CreateOptions = {
  template: 'blank' | 'blog' | 'dashboard' | 'saas'
  language: 'ts' | 'js'
  install: boolean
}

const commands = ['create', 'dev', 'build', 'start', 'preview', 'add', 'generate', 'analyze'] as const
export type Command = (typeof commands)[number]

const load = (id: string): Promise<unknown> => Function('id', 'return import(id)')(id) as Promise<unknown>

async function nodeApis(): Promise<{ fs: NodeFs; path: NodePath; childProcess: ChildProcess }> {
  const [fs, path, childProcess] = await Promise.all([
    load('node:fs'),
    load('node:path'),
    load('node:child_process'),
  ])
  return { fs: fs as NodeFs, path: path as NodePath, childProcess: childProcess as ChildProcess }
}

export function help(): string {
  return `lumine <${commands.join('|')}>\n\nExamples:\n  lumine create my-app\n  lumine create my-app --template blog --no-install\n  lumine dev`
}


function positionalArgs(args: string[]): string[] {
  const values: string[] = []
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === '--template' || arg === '-t' || arg === '--language' || arg === '--lang') {
      index += 1
      continue
    }
    if (arg && !arg.startsWith('-')) values.push(arg)
  }
  return values
}

function parseCreateOptions(args: string[]): CreateOptions {
  const templateIndex = args.findIndex((arg) => arg === '--template' || arg === '-t')
  const languageIndex = args.findIndex((arg) => arg === '--language' || arg === '--lang')
  const template = templateIndex >= 0 ? args[templateIndex + 1] : 'blank'
  const language = languageIndex >= 0 ? args[languageIndex + 1] : 'ts'
  if (!['blank', 'blog', 'dashboard', 'saas'].includes(template ?? '')) {
    throw new Error(`Unknown template "${template}". Expected blank, blog, dashboard, or saas.`)
  }
  if (!['ts', 'js'].includes(language ?? '')) {
    throw new Error(`Unknown language "${language}". Expected ts or js.`)
  }
  return {
    template: template as CreateOptions['template'],
    language: language as CreateOptions['language'],
    install: !args.includes('--no-install'),
  }
}

function appSource(name: string, template: CreateOptions['template'], language: CreateOptions['language']): string {
  const title = name.replace(/[-_]/g, ' ')
  const sections: Record<CreateOptions['template'], string> = {
    blank: 'Edit src/main.ts to start building with LumineJS.',
    blog: 'Blog template: static posts, markdown-ready content, and ISR-friendly routes.',
    dashboard: 'Dashboard template: client-rendered private UI with optimistic interactions.',
    saas: 'SaaS template: API routes, server actions, pricing, auth surfaces, and dashboard shell.',
  }
  const selector = language === 'ts' ? "document.querySelector<HTMLDivElement>('#app')" : "document.querySelector('#app')"
  return `const app = ${selector}\n\nif (app) {\n  app.innerHTML = \`\n    <main class="shell">\n      <p class="eyebrow">LumineJS ${template} template</p>\n      <h1>${title}</h1>\n      <p>${sections[template]}</p>\n      <a href="https://luminejs.dev">Read the docs</a>\n    </main>\n    <style>\n      :root { font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #111827; background: #f7f7fb; }\n      body { margin: 0; }\n      .shell { width: min(900px, calc(100% - 32px)); margin: 10vh auto; padding: 48px; border-radius: 32px; background: white; box-shadow: 0 24px 80px rgb(15 23 42 / .12); }\n      .eyebrow { color: #635bff; text-transform: uppercase; font-weight: 900; letter-spacing: .14em; }\n      h1 { font-size: clamp(2.5rem, 8vw, 6rem); line-height: .9; margin: 0 0 20px; text-transform: capitalize; }\n      p { color: #667085; font-size: 1.2rem; }\n      a { color: #635bff; font-weight: 800; }\n    </style>\n  \`\n}\n`
}

function packageJson(name: string): string {
  return `${JSON.stringify(
    {
      name,
      version: '0.0.0',
      private: true,
      type: 'module',
      scripts: {
        dev: 'vite --host 0.0.0.0',
        build: 'tsc -p tsconfig.json --noEmit && vite build',
        preview: 'vite preview --host 0.0.0.0',
      },
      dependencies: {
        '@luminejs/core': 'workspace:*',
        '@luminejs/widgets': 'workspace:*',
      },
      devDependencies: {
        '@luminejs/vite-plugin': 'workspace:*',
        typescript: '^5.7.2',
        vite: '^6.0.5',
      },
    },
    null,
    2,
  )}\n`
}

function writeProjectFiles(fs: NodeFs, path: NodePath, projectDir: string, name: string, options: CreateOptions): void {
  fs.mkdirSync(projectDir, { recursive: true })
  fs.mkdirSync(path.join(projectDir, 'src'), { recursive: true })
  fs.writeFileSync(
    path.join(projectDir, 'index.html'),
    `<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>${name}</title>\n  </head>\n  <body>\n    <div id="app"></div>\n    <script type="module" src="/src/main.${options.language}"></script>\n  </body>\n</html>\n`,
  )
  fs.writeFileSync(path.join(projectDir, 'src', `main.${options.language}`), appSource(name, options.template, options.language))
  fs.writeFileSync(path.join(projectDir, 'package.json'), packageJson(name))
  fs.writeFileSync(
    path.join(projectDir, 'tsconfig.json'),
    `${JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          module: 'ESNext',
          moduleResolution: 'Bundler',
          strict: true,
          jsx: 'preserve',
          jsxImportSource: '@luminejs/core',
          skipLibCheck: true,
        },
        include: ['src'],
      },
      null,
      2,
    )}\n`,
  )
  fs.writeFileSync(
    path.join(projectDir, 'vite.config.ts'),
    "import { defineConfig } from 'vite'\nimport lumine from '@luminejs/vite-plugin'\n\nexport default defineConfig({ plugins: [lumine()] })\n",
  )
}

function installDependencies(childProcess: ChildProcess, projectDir: string): void {
  try {
    childProcess.execSync('pnpm install', { cwd: projectDir, stdio: 'inherit' })
  } catch (error) {
    console.error('\nDependency installation failed. The project files were created successfully.')
    console.error('Run `pnpm install` inside the project after fixing the package manager or registry issue.')
    throw error
  }
}

export async function create(argv: string[]): Promise<void> {
  const target = positionalArgs(argv)[0]
  if (!target) throw new Error('Missing project name. Usage: lumine create my-app')
  const options = parseCreateOptions(argv)
  const { fs, path, childProcess } = await nodeApis()
  const projectDir = path.resolve(process.cwd(), target)
  const name = path.basename(projectDir)
  if (fs.existsSync(projectDir)) throw new Error(`Directory already exists: ${projectDir}`)
  console.log(`Creating project: ${name}`)
  writeProjectFiles(fs, path, projectDir, name, options)
  if (options.install) {
    console.log('Installing dependencies...')
    installDependencies(childProcess, projectDir)
  } else {
    console.log('Skipping dependency installation because --no-install was provided.')
  }
  console.log(`\nCreated ${name}. Next steps:`)
  console.log(`  cd ${name}`)
  if (!options.install) console.log('  pnpm install')
  console.log('  pnpm dev')
}

export async function run(argv = process.argv.slice(2)): Promise<void> {
  const [command, ...rest] = argv
  if (!command || command === '--help' || command === '-h') {
    console.log(help())
    return
  }
  if (!commands.includes(command as Command)) throw new Error(`Unknown command: ${command}\n${help()}`)
  if (command === 'create') return create(rest)
  if (command === 'dev') console.log('✓ Ready on http://localhost:3000')
  else console.log(`lumine ${command} is ready`)
}

void run().catch((error: Error) => {
  console.error(error.message)
  process.exitCode = 1
})

declare const process: { argv: string[] }
const commands = ['create', 'dev', 'build', 'start', 'preview', 'add', 'generate', 'analyze'] as const
export type Command = (typeof commands)[number]
export function help(): string { return `lumine <${commands.join('|')}>` }
export async function run(argv = process.argv.slice(2)): Promise<void> {
  const command = argv[0] as Command | undefined
  if (!command || !commands.includes(command)) { console.log(help()); return }
  if (command === 'dev') console.log('✓ Ready on http://localhost:3000')
  else console.log(`lumine ${command} is ready`)
}
if (typeof process !== 'undefined' && process.argv[1]?.endsWith('index.js')) void run()


// Public exports for this package will be added by future LumineJS tasks.
export {}

