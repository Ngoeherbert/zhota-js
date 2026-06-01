import type { RouteManifestEntry } from './route-types'

type Fs = { readdirSync(path: string): string[]; statSync(path: string): { isDirectory(): boolean } }
type Path = { join(...parts: string[]): string; relative(from: string, to: string): string; sep: string }
declare const require: (id: string) => unknown
const load = (id: string): unknown => Function('id', 'return require(id)')(id)
const fs = load('node:fs') as Fs
const path = load('node:path') as Path

function segmentToPath(segment: string): string {
  if (segment.startsWith('[...') && segment.endsWith(']')) return '*'
  if (segment.startsWith('[') && segment.endsWith(']')) return `:${segment.slice(1, -1)}`
  return segment
}
function routePath(parts: string[]): string { return `/${parts.map(segmentToPath).filter(Boolean).join('/')}`.replace(/\/+$|^$/g, '') || '/' }

export function scanRoutes(appDir: string): RouteManifestEntry[] {
  const entries: RouteManifestEntry[] = []
  const layouts = new Map<string, string>()
  const special = new Map<string, Partial<RouteManifestEntry>>()
  const walk = (dir: string) => {
    for (const name of fs.readdirSync(dir)) {
      const file = path.join(dir, name)
      if (fs.statSync(file).isDirectory()) walk(file)
      else {
        const rel = path.relative(appDir, file).split(path.sep)
        const folder = rel.slice(0, -1).join('/')
        if (name === 'layout.tsx') layouts.set(folder, file)
        if (['loading.tsx', 'error.tsx', 'not-found.tsx'].includes(name)) {
          const current = special.get(folder) ?? {}
          if (name === 'loading.tsx') current.loading = file
          if (name === 'error.tsx') current.error = file
          if (name === 'not-found.tsx') current.notFound = file
          special.set(folder, current)
        }
        if (name === 'page.tsx' || name === 'route.ts') {
          const isApi = rel.includes('api') && name === 'route.ts'
          const parts = rel.slice(0, -1).filter((part: string) => !(isApi && part === 'api'))
          const parentFolders = parts.map((_part: string, index: number) => parts.slice(0, index + 1).join('/'))
          const layout = [...parentFolders].reverse().map((key) => layouts.get(key)).find(Boolean) ?? layouts.get('')
          entries.push({ path: isApi ? `/api${routePath(parts)}`.replace('/api/', '/api/') : routePath(parts), file, component: file, layout, type: isApi ? 'api' : 'page', ...(special.get(folder) ?? {}) })
        }
      }
    }
  }
  walk(appDir)
  return entries.sort((a, b) => a.path.localeCompare(b.path))
}
