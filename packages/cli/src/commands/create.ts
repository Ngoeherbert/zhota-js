declare const process: {
  cwd(): string
}
declare const console: { log: (...args: unknown[]) => void }

type NodeFs = {
  copyFileSync(source: string, destination: string): void
  existsSync(path: string): boolean
  mkdirSync(path: string, options?: { recursive?: boolean }): void
  writeFileSync(path: string, data: string | Uint8Array): void
}

type NodePath = {
  basename(path: string): string
  dirname(path: string): string
  join(...parts: string[]): string
  resolve(...parts: string[]): string
}

type ChildProcess = {
  execSync(
    command: string,
    options?: { cwd?: string; stdio?: 'inherit' | 'pipe' | 'ignore' },
  ): unknown
}

type ExecError = Error & {
  stdout?: { toString(): string }
  stderr?: { toString(): string }
  output?: Array<{ toString(): string } | undefined>
}

type NodeUrl = {
  fileURLToPath(url: unknown): string
}

type CreateApis = {
  fs: NodeFs
  path: NodePath
  childProcess: ChildProcess
  nodeUrl: NodeUrl
}

const load = (id: string): Promise<unknown> =>
  Function('id', 'return import(id)')(id) as Promise<unknown>

async function nodeApis(): Promise<CreateApis> {
  const [fs, path, childProcess, nodeUrl] = await Promise.all([
    load('node:fs'),
    load('node:path'),
    load('node:child_process'),
    load('node:url'),
  ])
  return {
    fs: fs as NodeFs,
    path: path as NodePath,
    childProcess: childProcess as ChildProcess,
    nodeUrl: nodeUrl as NodeUrl,
  }
}

function positionalArgs(args: string[]): string[] {
  return args.filter((arg) => arg && !arg.startsWith('-'))
}

function layoutSource(): string {
  return `import './globals.css'
import { ThemeProvider } from '@luminejs/widgets'

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
`
}

function pageSource(): string {
  return `import { Stack, Text, Button } from '@luminejs/widgets'

export default function Home() {
  return (
    <Stack spacing="lg" align="center" style={{ minHeight: '100vh', justifyContent: 'center' }}>
      <Text as="h1" size="4xl" weight="bold">Welcome to LumineJS</Text>
      <Text size="lg" color="muted">Your full-stack JSX framework</Text>
      <Button variant="solid" color="primary">
        Get Started
      </Button>
    </Stack>
  )
}
`
}

function globalsSource(): string {
  return `@import '@luminejs/widgets/tokens/globals.css';

html,
body {
  padding: 0;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
`
}

function eslintSource(): string {
  return `${JSON.stringify(
    {
      extends: ['lumine/eslint-config'],
      rules: {},
    },
    null,
    2,
  )}
`
}

function gitignoreSource(): string {
  return `# dependencies
node_modules/
.pnpm-store/

# build output
.lumine/
dist/

# environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# debug logs
npm-debug.log*
pnpm-debug.log*

# OS files
.DS_Store
Thumbs.db

# editor
.vscode/
.idea/
*.swp
*.swo
`
}

function npmrcSource(): string {
  return `onlyBuiltDependencies[]=esbuild
onlyBuiltDependencies[]=sharp
`
}

function envSource(): string {
  return `/// <reference types="@luminejs/core/types" />

// Augment global types for LumineJS environment
declare namespace LumineJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test'
    readonly LUMINE_PUBLIC_URL?: string
  }
}
`
}

function configSource(): string {
  return `/** @type {import('@luminejs/core').LumineConfig} */
const config = {
  // Framework settings
  output: 'server',       // 'server' | 'static' | 'hybrid'

  // Image optimization
  images: {
    formats: ['webp', 'avif'],
    quality: 75,
    sizes: [640, 750, 828, 1080, 1200, 1920],
  },

  // Font loading
  fonts: [],

  // Dev server
  server: {
    port: 3000,
    open: false,
  },

  // Environment variables exposed to the client (prefix: LUMINE_PUBLIC_)
  publicEnv: [],
}

export default config
`
}

function packageJsonSource(name: string): string {
  return `{
  "name": "${name}",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev":     "lumine dev",
    "build":   "lumine build",
    "start":   "lumine start",
    "preview": "lumine preview",
    "lint":    "eslint . --ext .ts,.tsx"
  },
  "dependencies": {
    "@luminejs/core":    "latest",
    "@luminejs/widgets": "latest",
    "@luminejs/router":  "latest",
    "@luminejs/image":   "latest"
  },
  "devDependencies": {
    "@luminejs/cli":         "latest",
    "@luminejs/vite-plugin": "latest",
    "typescript":            "^5.4.0",
    "vite":                  "^6.0.0"
  }
}
`
}

function readmeSource(name: string): string {
  return `# ${name}

A [LumineJS](https://luminejs.dev) application.

## Getting Started

Run the development server:

\`\`\`bash
lumine dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Commands

| Command         | Description                        |
|-----------------|------------------------------------|
| \`lumine dev\`    | Start development server with HMR  |
| \`lumine build\`  | Build for production               |
| \`lumine start\`  | Start production server            |
| \`lumine preview\`| Preview production build locally   |

## Project Structure

\`\`\`
my-app/
├── app/              # App router — layouts, pages, API routes
├── pages/            # Pages router (alternative routing)
├── public/           # Static assets
├── lumine.config.js  # Framework configuration
└── tsconfig.json     # TypeScript configuration
\`\`\`

## Learn More

- [LumineJS Documentation](https://luminejs.dev/docs)
- [Widget Reference](https://luminejs.dev/api)
- [Deployment Guide](https://luminejs.dev/docs/deployment)
`
}

function tsconfigSource(): string {
  return `{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "jsxImportSource": "@luminejs/core",
    "incremental": true,
    "plugins": [
      { "name": "@luminejs/typescript-plugin" }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "lumine-env.d.ts", "**/*.ts", "**/*.tsx", ".lumine/types/**/*.ts"],
  "exclude": ["node_modules"]
}
`
}

const FAVICON_SIZE = 32
type Rgba = readonly [red: number, green: number, blue: number, alpha: number]

function setUint16LE(bytes: Uint8Array, offset: number, value: number): void {
  bytes[offset] = value & 0xff
  bytes[offset + 1] = (value >> 8) & 0xff
}

function setUint32LE(bytes: Uint8Array, offset: number, value: number): void {
  bytes[offset] = value & 0xff
  bytes[offset + 1] = (value >> 8) & 0xff
  bytes[offset + 2] = (value >> 16) & 0xff
  bytes[offset + 3] = (value >> 24) & 0xff
}

function blendPixel(pixels: Uint8Array, x: number, y: number, color: Rgba, coverage: number): void {
  if (x < 0 || x >= FAVICON_SIZE || y < 0 || y >= FAVICON_SIZE || coverage <= 0) return
  const index = (y * FAVICON_SIZE + x) * 4
  const sourceAlpha = (color[3] / 255) * Math.min(1, coverage)
  const destinationAlpha = (pixels[index + 3] ?? 0) / 255
  const outputAlpha = sourceAlpha + destinationAlpha * (1 - sourceAlpha)
  if (outputAlpha <= 0) return
  pixels[index] = Math.round(
    (color[0] * sourceAlpha + (pixels[index] ?? 0) * destinationAlpha * (1 - sourceAlpha)) /
      outputAlpha,
  )
  pixels[index + 1] = Math.round(
    (color[1] * sourceAlpha + (pixels[index + 1] ?? 0) * destinationAlpha * (1 - sourceAlpha)) /
      outputAlpha,
  )
  pixels[index + 2] = Math.round(
    (color[2] * sourceAlpha + (pixels[index + 2] ?? 0) * destinationAlpha * (1 - sourceAlpha)) /
      outputAlpha,
  )
  pixels[index + 3] = Math.round(outputAlpha * 255)
}

function drawCircle(
  pixels: Uint8Array,
  centerX: number,
  centerY: number,
  radius: number,
  color: Rgba,
): void {
  const minX = Math.floor(centerX - radius - 1)
  const maxX = Math.ceil(centerX + radius + 1)
  const minY = Math.floor(centerY - radius - 1)
  const maxY = Math.ceil(centerY + radius + 1)
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const distance = Math.hypot(x + 0.5 - centerX, y + 0.5 - centerY)
      blendPixel(pixels, x, y, color, radius + 0.5 - distance)
    }
  }
}

function createFaviconIco(): Uint8Array {
  const pixels = new Uint8Array(FAVICON_SIZE * FAVICON_SIZE * 4)
  const nodes: Array<{ centerX: number; centerY: number; radius: number; color: Rgba }> = [
    { centerX: 10, centerY: 7, radius: 5, color: [62, 88, 183, 255] },
    { centerX: 19, centerY: 5, radius: 5, color: [75, 127, 213, 255] },
    { centerX: 7, centerY: 16, radius: 5, color: [85, 78, 184, 255] },
    { centerX: 16, centerY: 15, radius: 5, color: [78, 180, 199, 255] },
    { centerX: 25, centerY: 14, radius: 5, color: [94, 204, 166, 255] },
    { centerX: 10, centerY: 25, radius: 5, color: [50, 118, 214, 255] },
    { centerX: 21, centerY: 25, radius: 5, color: [94, 201, 165, 255] },
  ]
  for (const node of nodes) {
    drawCircle(pixels, node.centerX, node.centerY, node.radius, node.color)
  }

  const headerSize = 6
  const directoryEntrySize = 16
  const bitmapHeaderSize = 40
  const xorBitmapSize = FAVICON_SIZE * FAVICON_SIZE * 4
  const andMaskRowSize = Math.ceil(FAVICON_SIZE / 32) * 4
  const andMaskSize = andMaskRowSize * FAVICON_SIZE
  const imageOffset = headerSize + directoryEntrySize
  const imageSize = bitmapHeaderSize + xorBitmapSize + andMaskSize
  const bytes = new Uint8Array(imageOffset + imageSize)

  setUint16LE(bytes, 2, 1)
  setUint16LE(bytes, 4, 1)
  bytes[6] = FAVICON_SIZE
  bytes[7] = FAVICON_SIZE
  setUint16LE(bytes, 12, 32)
  setUint32LE(bytes, 14, imageSize)
  setUint32LE(bytes, 18, imageOffset)

  setUint32LE(bytes, imageOffset, bitmapHeaderSize)
  setUint32LE(bytes, imageOffset + 4, FAVICON_SIZE)
  setUint32LE(bytes, imageOffset + 8, FAVICON_SIZE * 2)
  setUint16LE(bytes, imageOffset + 12, 1)
  setUint16LE(bytes, imageOffset + 14, 32)
  setUint32LE(bytes, imageOffset + 20, xorBitmapSize)

  const bitmapOffset = imageOffset + bitmapHeaderSize
  for (let y = 0; y < FAVICON_SIZE; y += 1) {
    for (let x = 0; x < FAVICON_SIZE; x += 1) {
      const sourceIndex = ((FAVICON_SIZE - 1 - y) * FAVICON_SIZE + x) * 4
      const targetIndex = bitmapOffset + (y * FAVICON_SIZE + x) * 4
      bytes[targetIndex] = pixels[sourceIndex + 2] ?? 0
      bytes[targetIndex + 1] = pixels[sourceIndex + 1] ?? 0
      bytes[targetIndex + 2] = pixels[sourceIndex] ?? 0
      bytes[targetIndex + 3] = pixels[sourceIndex + 3] ?? 0
    }
  }

  const maskOffset = bitmapOffset + xorBitmapSize
  for (let y = 0; y < FAVICON_SIZE; y += 1) {
    for (let x = 0; x < FAVICON_SIZE; x += 1) {
      const alpha = pixels[((FAVICON_SIZE - 1 - y) * FAVICON_SIZE + x) * 4 + 3]
      if (alpha === 0) {
        const maskIndex = maskOffset + y * andMaskRowSize + Math.floor(x / 8)
        bytes[maskIndex] = (bytes[maskIndex] ?? 0) | (0x80 >> (x % 8))
      }
    }
  }

  return bytes
}

function copyAsset(
  fs: NodeFs,
  path: NodePath,
  nodeUrl: NodeUrl,
  fileName: string,
  destination: string,
): void {
  const entryDir = path.dirname(nodeUrl.fileURLToPath(import.meta.url))
  const source = [
    path.resolve(entryDir, '..', 'assets', fileName),
    path.resolve(entryDir, '..', '..', 'assets', fileName),
  ].find((candidate) => fs.existsSync(candidate))
  if (!source) throw new Error(`Missing bundled asset: ${fileName}`)
  fs.copyFileSync(source, destination)
}

function writeProjectFiles(
  fs: NodeFs,
  path: NodePath,
  nodeUrl: NodeUrl,
  projectDir: string,
  name: string,
): void {
  fs.mkdirSync(projectDir, { recursive: true })
  fs.mkdirSync(path.join(projectDir, 'app', 'api'), { recursive: true })
  fs.mkdirSync(path.join(projectDir, 'pages'), { recursive: true })
  fs.mkdirSync(path.join(projectDir, 'public'), { recursive: true })

  fs.writeFileSync(path.join(projectDir, 'app', 'layout.tsx'), layoutSource())
  fs.writeFileSync(path.join(projectDir, 'app', 'page.tsx'), pageSource())
  fs.writeFileSync(path.join(projectDir, 'app', 'globals.css'), globalsSource())
  fs.writeFileSync(path.join(projectDir, 'app', 'api', '.gitkeep'), '')
  fs.writeFileSync(path.join(projectDir, 'pages', '.gitkeep'), '')
  fs.writeFileSync(path.join(projectDir, 'public', 'favicon.ico'), createFaviconIco())
  copyAsset(fs, path, nodeUrl, 'lumine.svg', path.join(projectDir, 'public', 'lumine.svg'))
  fs.writeFileSync(path.join(projectDir, '.eslintrc.json'), eslintSource())
  fs.writeFileSync(path.join(projectDir, '.gitignore'), gitignoreSource())
  fs.writeFileSync(path.join(projectDir, '.npmrc'), npmrcSource())
  fs.writeFileSync(path.join(projectDir, 'lumine-env.d.ts'), envSource())
  fs.writeFileSync(path.join(projectDir, 'lumine.config.js'), configSource())
  fs.writeFileSync(path.join(projectDir, 'package.json'), packageJsonSource(name))
  fs.writeFileSync(path.join(projectDir, 'README.md'), readmeSource(name))
  fs.writeFileSync(path.join(projectDir, 'tsconfig.json'), tsconfigSource())
}

function errorOutput(error: unknown): string {
  const execError = error as ExecError
  return [
    execError.message,
    execError.stdout?.toString(),
    execError.stderr?.toString(),
    ...(execError.output?.map((value) => value?.toString()) ?? []),
  ]
    .filter(Boolean)
    .join('\n')
}

function installDependencies(
  fs: NodeFs,
  path: NodePath,
  childProcess: ChildProcess,
  projectDir: string,
): void {
  try {
    childProcess.execSync('pnpm install', { cwd: projectDir, stdio: 'pipe' })
  } catch (error) {
    const output = errorOutput(error)
    if (!output.includes('ERR_PNPM_IGNORED_BUILDS')) {
      throw new Error(output || (error instanceof Error ? error.message : String(error)))
    }
    fs.writeFileSync(path.join(projectDir, '.npmrc'), npmrcSource())
    try {
      childProcess.execSync('pnpm approve-builds', { cwd: projectDir, stdio: 'ignore' })
    } catch {
      // Older pnpm versions do not have approve-builds; the generated .npmrc is enough for retry.
    }
    childProcess.execSync('pnpm install', { cwd: projectDir, stdio: 'inherit' })
  }
}

export async function create(argv: string[]): Promise<void> {
  const target = positionalArgs(argv)[0]
  if (!target) throw new Error('Missing project name. Usage: lumine create my-app')
  const { fs, path, childProcess, nodeUrl } = await nodeApis()
  const projectDir = path.resolve(process.cwd(), target)
  const name = path.basename(projectDir)
  if (fs.existsSync(projectDir)) throw new Error(`Directory already exists: ${projectDir}`)
  writeProjectFiles(fs, path, nodeUrl, projectDir, name)
  installDependencies(fs, path, childProcess, projectDir)
  console.log(`✓ Created ${name}`)
  console.log('')
  console.log('  Next steps:')
  console.log(`    cd ${name}`)
  console.log('    lumine dev')
  console.log('')
  console.log('  Documentation: https://luminejs.dev/docs')
}
