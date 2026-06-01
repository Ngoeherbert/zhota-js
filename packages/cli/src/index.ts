#!/usr/bin/env node
declare const process: {
  argv: string[]
  cwd(): string
  exitCode?: number
  env: Record<string, string | undefined>
  platform: string
  on(event: string, listener: () => void): void
}
declare const console: { log: (...args: unknown[]) => void; error: (...args: unknown[]) => void }
declare const URL: {
  new (
    input: string,
    base?: string,
  ): { pathname: string; searchParams: { get(name: string): string | null } }
}

type NodeFs = {
  existsSync(path: string): boolean
  mkdirSync(path: string, options?: { recursive?: boolean }): void
  readFileSync(path: string, encoding: 'utf8'): string
  writeFileSync(path: string, data: string): void
}

type NodePath = {
  join(...parts: string[]): string
  resolve(...parts: string[]): string
  basename(path: string): string
}

type ChildProcessHandle = {
  kill(signal?: string): void
  on(event: string, listener: (code?: number) => void): void
}

type ChildProcess = {
  exec(command: string, options?: { stdio?: 'ignore'; detached?: boolean }): ChildProcessHandle
  execSync(command: string, options?: { cwd?: string; stdio?: 'inherit' | 'pipe' | 'ignore' }): void
  spawn(
    command: string,
    args?: string[],
    options?: { cwd?: string; stdio?: 'inherit' | 'pipe' | 'ignore'; shell?: boolean },
  ): ChildProcessHandle
}

type HttpRequest = { url?: string; method?: string }
type HttpResponse = {
  statusCode: number
  setHeader(name: string, value: string): void
  end(body?: string): void
}
type HttpServer = {
  listen(port: number, hostname: string, callback: () => void): void
  close(callback?: () => void): void
}
type Http = {
  createServer(
    handler: (request: HttpRequest, response: HttpResponse) => void | Promise<void>,
  ): HttpServer
}

type SourceLanguage = 'ts' | 'js' | 'tsx' | 'jsx'
type RouteLanguage = 'ts' | 'js'
type JsxLanguage = 'tsx' | 'jsx'

type CreateOptions = {
  template: 'blank' | 'blog' | 'dashboard' | 'saas'
  language: SourceLanguage
  install: boolean
}

type DevOptions = {
  clientPort: number
  serverPort: number
  open: boolean
}

const commands = [
  'create',
  'dev',
  'build',
  'start',
  'preview',
  'add',
  'generate',
  'analyze',
] as const
export type Command = (typeof commands)[number]

const load = (id: string): Promise<unknown> =>
  Function('id', 'return import(id)')(id) as Promise<unknown>

async function nodeApis(): Promise<{
  fs: NodeFs
  path: NodePath
  childProcess: ChildProcess
  http: Http
}> {
  const [fs, path, childProcess, http] = await Promise.all([
    load('node:fs'),
    load('node:path'),
    load('node:child_process'),
    load('node:http'),
  ])
  return {
    fs: fs as NodeFs,
    path: path as NodePath,
    childProcess: childProcess as ChildProcess,
    http: http as Http,
  }
}

export function help(): string {
  return `lemine <${commands.join('|')}>

Examples:
  lemine create my-app
  lemine create my-app --template blog --language tsx --no-install
  lemine dev
  lemine dev --port 3000 --server-port 3001 --no-open`
}

function positionalArgs(args: string[]): string[] {
  const values: string[] = []
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (
      ['--template', '-t', '--language', '--lang', '--port', '-p', '--server-port'].includes(
        arg ?? '',
      )
    ) {
      index += 1
      continue
    }
    if (arg && !arg.startsWith('-')) values.push(arg)
  }
  return values
}

function numberOption(args: string[], names: string[], fallback: number): number {
  const index = args.findIndex((arg) => names.includes(arg))
  const value = index >= 0 ? Number(args[index + 1]) : fallback
  if (!Number.isFinite(value) || value <= 0)
    throw new Error(`Invalid numeric option for ${names.join('/')}`)
  return value
}

function parseCreateOptions(args: string[]): CreateOptions {
  const templateIndex = args.findIndex((arg) => arg === '--template' || arg === '-t')
  const languageIndex = args.findIndex((arg) => arg === '--language' || arg === '--lang')
  const template = templateIndex >= 0 ? args[templateIndex + 1] : 'blank'
  const language = languageIndex >= 0 ? args[languageIndex + 1] : 'ts'
  if (!['blank', 'blog', 'dashboard', 'saas'].includes(template ?? '')) {
    throw new Error(`Unknown template "${template}". Expected blank, blog, dashboard, or saas.`)
  }
  if (!['ts', 'js', 'tsx', 'jsx'].includes(language ?? '')) {
    throw new Error(`Unknown language "${language}". Expected ts, js, tsx, or jsx.`)
  }
  return {
    template: template as CreateOptions['template'],
    language: language as CreateOptions['language'],
    install: !args.includes('--no-install'),
  }
}

function parseDevOptions(args: string[]): DevOptions {
  return {
    clientPort: numberOption(args, ['--port', '-p'], 3000),
    serverPort: numberOption(args, ['--server-port'], 3001),
    open: !args.includes('--no-open'),
  }
}

function isTypeScriptLanguage(language: SourceLanguage): boolean {
  return language === 'ts' || language === 'tsx'
}

function routeLanguage(language: SourceLanguage): RouteLanguage {
  return isTypeScriptLanguage(language) ? 'ts' : 'js'
}

function jsxLanguage(language: SourceLanguage): JsxLanguage {
  return isTypeScriptLanguage(language) ? 'tsx' : 'jsx'
}

function mainSource(language: SourceLanguage): string {
  const appSelector = isTypeScriptLanguage(language)
    ? "document.querySelector<HTMLDivElement>('#app')"
    : "document.querySelector('#app')"
  if (language === 'tsx' || language === 'jsx') {
    return `import { render } from '@leminejs/core'
import { App } from './App'
import './styles.css'

const app = ${appSelector}

if (app) {
  render(<App />, app)
}
`
  }
  return `import { render } from '@leminejs/core'
import { App } from './App'
import './styles.css'

const app = ${appSelector}

if (app) {
  render(App, app)
}
`
}

function appSource(
  name: string,
  template: CreateOptions['template'],
  language: SourceLanguage,
): string {
  const title = name.replace(/[-_]/g, ' ')
  const sections: Record<CreateOptions['template'], string> = {
    blank:
      'Edit app/App.' +
      jsxLanguage(language) +
      ' and app/api/hello/route.' +
      routeLanguage(language) +
      ' to start building with LemineJS.',
    blog: 'Blog template: static posts, markdown-ready content, ISR-friendly routes, and API routes.',
    dashboard:
      'Dashboard template: client-rendered private UI with optimistic interactions and a local API.',
    saas: 'SaaS template: API routes, server actions, pricing, auth surfaces, and dashboard shell.',
  }
  const typeDefinitions = isTypeScriptLanguage(language)
    ? `type ServerMessage = {
  message?: string
}

`
    : ''
  const dataType = isTypeScriptLanguage(language) ? ': ServerMessage' : ''
  const returnType = isTypeScriptLanguage(language) ? ': Promise<string>' : ''
  return `import { useMount, useSignal } from '@leminejs/core'

${typeDefinitions}async function loadServerMessage()${returnType} {
  try {
    const response = await fetch('/api/hello')
    const data${dataType} = await response.json()
    return data.message ?? 'Hello from LemineJS.'
  } catch {
    return 'The Lemine server is still starting. Refresh in a moment.'
  }
}

export function App() {
  const [serverMessage, setServerMessage] = useSignal('Loading server message...')

  useMount(() => {
    void loadServerMessage().then(setServerMessage)
  })

  return (
    <main class="shell">
      <p class="eyebrow">LemineJS ${template} template</p>
      <h1>${title}</h1>
      <p>${sections[template]}</p>
      <section class="server-card">
        <strong>Server says:</strong>
        <span>{serverMessage}</span>
      </section>
      <p class="hint">
        Run <code>lemine dev</code> to start the client and server together.
      </p>
    </main>
  )
}
`
}

function stylesSource(): string {
  return `:root {
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  color: #111827;
  background: #f7f7fb;
}

body {
  margin: 0;
}

.shell {
  width: min(900px, calc(100% - 32px));
  margin: 10vh auto;
  padding: 48px;
  border-radius: 32px;
  background: white;
  box-shadow: 0 24px 80px rgb(15 23 42 / 12%);
}

.eyebrow {
  color: #635bff;
  text-transform: uppercase;
  font-weight: 900;
  letter-spacing: .14em;
}

h1 {
  font-size: clamp(2.5rem, 8vw, 6rem);
  line-height: .9;
  margin: 0 0 20px;
  text-transform: capitalize;
}

p {
  color: #667085;
  font-size: 1.2rem;
}

code {
  background: #eef2ff;
  color: #3730a3;
  padding: 2px 6px;
  border-radius: 8px;
}

.server-card {
  display: grid;
  gap: 8px;
  border: 1px solid #d9ddff;
  background: #f5f6ff;
  border-radius: 18px;
  padding: 18px;
  margin: 24px 0;
}

.server-card span {
  color: #475467;
}

.hint {
  font-size: 1rem;
}
`
}

function apiRouteSource(language: RouteLanguage): string {
  const type = language === 'ts' ? ': Promise<Response>' : ''
  return `export async function GET()${type} {
  return Response.json({
    message: 'Hello from the Lemine server. Edit app/api/hello/route.${language} to change this response.',
    framework: 'LemineJS',
  })
}
`
}

function packageJson(name: string, language: SourceLanguage): string {
  const isTypeScript = isTypeScriptLanguage(language)
  const scripts = isTypeScript
    ? {
        dev: 'lemine dev',
        'dev:client': 'vite --host 0.0.0.0 --port 3000',
        'dev:server': 'lemine dev --server-only',
        build: 'tsc -p tsconfig.json --noEmit && vite build',
        preview: 'vite preview --host 0.0.0.0',
      }
    : {
        dev: 'lemine dev',
        'dev:client': 'vite --host 0.0.0.0 --port 3000',
        'dev:server': 'lemine dev --server-only',
        build: 'vite build',
        preview: 'vite preview --host 0.0.0.0',
      }
  return `${JSON.stringify(
    {
      name,
      version: '0.0.0',
      private: true,
      type: 'module',
      scripts,
      dependencies: {
        '@leminejs/core': '^0.0.0',
      },
      devDependencies: {
        '@leminejs/cli': '^0.0.0',
        '@leminejs/vite-plugin': '^0.0.0',
        typescript: '^5.7.2',
        vite: '^6.0.5',
      },
      pnpm: {
        onlyBuiltDependencies: ['esbuild'],
      },
    },
    null,
    2,
  )}
`
}

function tsconfigSource(language: SourceLanguage): string {
  return `${JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'Bundler',
        strict: true,
        jsx: 'preserve',
        jsxImportSource: '@leminejs/core',
        allowJs: !isTypeScriptLanguage(language),
        checkJs: false,
        skipLibCheck: true,
      },
      include: ['app', 'pages', 'lemine-env.d.ts'],
    },
    null,
    2,
  )}
`
}

function viteConfigSource(_language: SourceLanguage): string {
  return `import { defineConfig } from 'vite'
import { lemine } from '@leminejs/vite-plugin'

export default defineConfig({
  plugins: [lemine()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
`
}

function readmeSource(name: string, language: SourceLanguage): string {
  return `# ${name}

This project was created with \`lemine create\`.

## Project structure

- \`app/\` contains your app entry, JSX components, styles, and API routes.
- \`pages/\` is available for page-style routes as your app grows.
- \`public/\` stores static assets served from the site root.

## Scripts

- \`pnpm dev\` starts the Lemine client and server.
- \`pnpm build\` builds the app${isTypeScriptLanguage(language) ? ' after type-checking it' : ''}.
- \`pnpm preview\` previews the production build.
`
}

function writeProjectFiles(
  fs: NodeFs,
  path: NodePath,
  projectDir: string,
  name: string,
  options: CreateOptions,
): void {
  const appExtension = jsxLanguage(options.language)
  const mainExtension = options.language
  const apiExtension = routeLanguage(options.language)
  const configExtension = isTypeScriptLanguage(options.language) ? 'ts' : 'js'

  fs.mkdirSync(projectDir, { recursive: true })
  fs.mkdirSync(path.join(projectDir, 'app'), { recursive: true })
  fs.mkdirSync(path.join(projectDir, 'app', 'api', 'hello'), { recursive: true })
  fs.mkdirSync(path.join(projectDir, 'pages'), { recursive: true })
  fs.mkdirSync(path.join(projectDir, 'public'), { recursive: true })
  fs.writeFileSync(
    path.join(projectDir, 'index.html'),
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${name}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/app/main.${mainExtension}"></script>
  </body>
</html>
`,
  )
  fs.writeFileSync(
    path.join(projectDir, 'app', `main.${mainExtension}`),
    mainSource(options.language),
  )
  fs.writeFileSync(
    path.join(projectDir, 'app', `App.${appExtension}`),
    appSource(name, options.template, options.language),
  )
  fs.writeFileSync(path.join(projectDir, 'app', 'styles.css'), stylesSource())
  fs.writeFileSync(
    path.join(projectDir, 'app', 'api', 'hello', `route.${apiExtension}`),
    apiRouteSource(apiExtension),
  )
  fs.writeFileSync(path.join(projectDir, 'pages', `.gitkeep`), '')
  fs.writeFileSync(path.join(projectDir, 'public', `.gitkeep`), '')
  fs.writeFileSync(path.join(projectDir, '.gitignore'), 'node_modules\ndist\n.env\n.env.local\n')
  fs.writeFileSync(
    path.join(projectDir, 'lemine-env.d.ts'),
    '/// <reference types="vite/client" />\n',
  )
  fs.writeFileSync(
    path.join(projectDir, `vite.config.${configExtension}`),
    viteConfigSource(options.language),
  )
  fs.writeFileSync(path.join(projectDir, 'package.json'), packageJson(name, options.language))
  fs.writeFileSync(path.join(projectDir, 'README.md'), readmeSource(name, options.language))
  fs.writeFileSync(path.join(projectDir, 'tsconfig.json'), tsconfigSource(options.language))
}

function installDependencies(childProcess: ChildProcess, projectDir: string): boolean {
  try {
    childProcess.execSync('pnpm install', { cwd: projectDir, stdio: 'inherit' })
    return true
  } catch {
    console.log(
      '\nDependency installation did not complete, but the project files were created successfully.',
    )
    console.log(
      'The generated package.json allows esbuild build scripts via pnpm.onlyBuiltDependencies.',
    )
    console.log(
      'Run `pnpm install` again inside the project after resolving the package-manager message above.',
    )
    return false
  }
}

function responseJson(response: HttpResponse, statusCode: number, body: unknown): void {
  response.statusCode = statusCode
  response.setHeader('content-type', 'application/json; charset=utf-8')
  response.setHeader('access-control-allow-origin', '*')
  response.end(JSON.stringify(body))
}

async function invokeApiRoute(
  fs: NodeFs,
  path: NodePath,
  projectDir: string,
  requestPath: string,
  method: string,
): Promise<Response | undefined> {
  const segments = requestPath
    .replace(/^\/api\/?/, '')
    .split('/')
    .filter(Boolean)
  const routeBase = path.join(projectDir, 'app', 'api', ...segments, 'route')
  const routeFile = ['ts', 'js']
    .map((extension) => `${routeBase}.${extension}`)
    .find((file) => fs.existsSync(file))
  if (!routeFile) return undefined
  const source = fs.readFileSync(routeFile, 'utf8')
  const match = source.match(
    new RegExp(
      `export\\s+async\\s+function\\s+${method}\\s*\\([^)]*\\)\\s*(?::[^'{]+)?\\s*{([\\s\\S]*)}`,
    ),
  )
  if (!match?.[1]) return undefined
  const factory = Function('Response', `return (async function ${method}(){${match[1]}})`) as (
    responseConstructor: typeof Response,
  ) => () => Promise<Response>
  return factory(Response)()
}

async function startApiServer(
  fs: NodeFs,
  path: NodePath,
  http: Http,
  projectDir: string,
  serverPort: number,
): Promise<HttpServer> {
  const server = http.createServer(async (request, response) => {
    const url = new URL(request.url ?? '/', `http://localhost:${serverPort}`)
    if (request.method === 'OPTIONS') {
      responseJson(response, 204, null)
      return
    }
    if (!url.pathname.startsWith('/api/')) {
      responseJson(response, 404, {
        error: 'Not found',
        hint: 'Create API routes under app/api/**/route.ts or route.js',
      })
      return
    }
    try {
      const apiResponse = await invokeApiRoute(
        fs,
        path,
        projectDir,
        url.pathname,
        request.method ?? 'GET',
      )
      if (!apiResponse) {
        responseJson(response, 404, { error: `No route found for ${url.pathname}` })
        return
      }
      response.statusCode = apiResponse.status
      apiResponse.headers.forEach((value, key) => response.setHeader(key, value))
      response.setHeader('access-control-allow-origin', '*')
      response.end(await apiResponse.text())
    } catch (error) {
      responseJson(response, 500, { error: error instanceof Error ? error.message : String(error) })
    }
  })
  await new Promise<void>((resolve) => server.listen(serverPort, '0.0.0.0', resolve))
  return server
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForClient(url: string, timeoutMs = 30_000): Promise<boolean> {
  const deadline = Date.now() + timeoutMs
  let consecutiveSuccessfulChecks = 0
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { method: 'GET', cache: 'no-store' })
      consecutiveSuccessfulChecks = response.ok ? consecutiveSuccessfulChecks + 1 : 0
      if (consecutiveSuccessfulChecks >= 3) {
        await sleep(750)
        return true
      }
    } catch {
      consecutiveSuccessfulChecks = 0
      // Vite is still starting; keep polling before opening the browser.
    }
    await sleep(250)
  }
  return false
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\''`)}'`
}

function openBrowser(childProcess: ChildProcess, url: string): void {
  const command =
    process.platform === 'darwin'
      ? `open ${shellQuote(url)}`
      : process.platform === 'win32'
        ? `start "" "${url}"`
        : `xdg-open ${shellQuote(url)}`
  try {
    childProcess.exec(command, { stdio: 'ignore', detached: true })
  } catch {
    // Opening a browser is best-effort and should never stop the dev server.
  }
}

export async function create(argv: string[]): Promise<void> {
  const target = positionalArgs(argv)[0]
  if (!target) throw new Error('Missing project name. Usage: lemine create my-app')
  const options = parseCreateOptions(argv)
  const { fs, path, childProcess } = await nodeApis()
  const projectDir = path.resolve(process.cwd(), target)
  const name = path.basename(projectDir)
  if (fs.existsSync(projectDir)) throw new Error(`Directory already exists: ${projectDir}`)
  console.log(`Creating project: ${name}`)
  writeProjectFiles(fs, path, projectDir, name, options)
  let installed = false
  if (options.install) {
    console.log('Installing dependencies...')
    installed = installDependencies(childProcess, projectDir)
  } else {
    console.log('Skipping dependency installation because --no-install was provided.')
  }
  console.log(`\nCreated ${name}. Next steps:`)
  console.log(`  cd ${name}`)
  if (!options.install || !installed) console.log('  pnpm install')
  console.log('  lemine dev')
}

export async function dev(argv: string[]): Promise<void> {
  const options = parseDevOptions(argv)
  const { fs, path, childProcess, http } = await nodeApis()
  const projectDir = process.cwd()
  const server = await startApiServer(fs, path, http, projectDir, options.serverPort)
  if (argv.includes('--server-only')) {
    console.log(`✓ Lemine server ready on http://localhost:${options.serverPort}`)
    await new Promise<void>(() => undefined)
    return
  }
  const viteArgs = ['exec', 'vite', '--host', '0.0.0.0', '--port', String(options.clientPort)]
  const vite = childProcess.spawn('pnpm', viteArgs, {
    cwd: projectDir,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
  const url = `http://127.0.0.1:${options.clientPort}`
  console.log(`✓ Lemine server ready on http://127.0.0.1:${options.serverPort}`)
  console.log(`• Waiting for Lemine client on ${url} before opening the browser...`)
  const clientReady = await waitForClient(url)
  if (clientReady) {
    console.log(`✓ Lemine client ready on ${url}`)
    console.log(`✓ API routes are available on ${url}/api/* and proxied to the Lemine server`)
    if (options.open) openBrowser(childProcess, url)
  } else {
    console.log(
      `⚠ Lemine client did not respond on ${url} within 30 seconds. Keeping dev processes running; open the URL manually when Vite finishes starting.`,
    )
  }
  const shutdown = () => {
    vite.kill('SIGTERM')
    server.close()
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
  await new Promise<void>((resolve) =>
    vite.on('exit', () => {
      server.close(resolve)
    }),
  )
}

export async function run(argv = process.argv.slice(2)): Promise<void> {
  const [command, ...rest] = argv
  if (!command || command === '--help' || command === '-h') {
    console.log(help())
    return
  }
  if (!commands.includes(command as Command))
    throw new Error(`Unknown command: ${command}\n${help()}`)
  if (command === 'create') return create(rest)
  if (command === 'dev') return dev(rest)
  else console.log(`lemine ${command} is ready`)
}

void run().catch((error: Error) => {
  console.error(error.message)
  process.exitCode = 1
})
