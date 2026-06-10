#!/usr/bin/env node
import { create } from './commands/create.js'

declare const process: {
  argv: string[]
  cwd(): string
  exitCode?: number
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
  readFileSync(path: string, encoding: 'utf8'): string
}

type NodePath = {
  join(...parts: string[]): string
}

type ChildProcessHandle = {
  kill(signal?: string): void
  on(event: string, listener: (code?: number) => void): void
}

type ChildProcess = {
  exec(command: string, options?: { stdio?: 'ignore'; detached?: boolean }): ChildProcessHandle
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
export { create }

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
  lemine create my-app --install
  lemine dev
  lemine dev --port 3000 --server-port 3001 --no-open`
}

function numberOption(args: string[], names: string[], fallback: number): number {
  const index = args.findIndex((arg) => names.includes(arg))
  const value = index >= 0 ? Number(args[index + 1]) : fallback
  if (!Number.isFinite(value) || value <= 0)
    throw new Error(`Invalid numeric option for ${names.join('/')}`)
  return value
}

function parseDevOptions(args: string[]): DevOptions {
  return {
    clientPort: numberOption(args, ['--port', '-p'], 3000),
    serverPort: numberOption(args, ['--server-port'], 3001),
    open: !args.includes('--no-open'),
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
  const routeFile = ['ts', 'tsx', 'js', 'jsx']
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
        hint: 'Create API routes under app/api/**/route.ts, route.tsx, route.js, or route.jsx',
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

async function waitForClient(url: string, timeoutMs = 60_000): Promise<boolean> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      await fetch(url, { method: 'GET', cache: 'no-store' })
      await sleep(500)
      return true
    } catch {
      // Vite still starting, keep polling
    }
    await sleep(250)
  }
  return false
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, "'\\''")}'`
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
      `⚠ Lemine client did not respond on ${url} within 60 seconds. Keeping dev processes running; open the URL manually when Vite finishes starting.`,
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
