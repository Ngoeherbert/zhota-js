import fs from 'node:fs'
import path from 'node:path'

import type { RouteManifestEntry } from './route-types'

const PAGE_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'] as const
const LOGIC_EXTENSIONS = ['.ts', '.js'] as const

function segmentToPath(segment: string): string {
  if (segment.startsWith('[...') && segment.endsWith(']')) return '*'
  if (segment.startsWith('[') && segment.endsWith(']')) return `:${segment.slice(1, -1)}`
  return segment
}
function routePath(parts: string[]): string {
  return `/${parts.map(segmentToPath).filter(Boolean).join('/')}`.replace(/\/+$/g, '') || '/'
}

export function isPageFile(filename: string): boolean {
  return PAGE_EXTENSIONS.some((extension) => filename === `page${extension}`)
}

export function isLayoutFile(filename: string): boolean {
  return PAGE_EXTENSIONS.some((extension) => filename === `layout${extension}`)
}

export function isApiRouteFile(filename: string): boolean {
  return LOGIC_EXTENSIONS.some((extension) => filename === `route${extension}`)
}

export function isLoadingFile(filename: string): boolean {
  return PAGE_EXTENSIONS.some((extension) => filename === `loading${extension}`)
}

export function isErrorFile(filename: string): boolean {
  return PAGE_EXTENSIONS.some((extension) => filename === `error${extension}`)
}

export function isNotFoundFile(filename: string): boolean {
  return PAGE_EXTENSIONS.some((extension) => filename === `not-found${extension}`)
}

export function isMiddlewareFile(filename: string): boolean {
  return LOGIC_EXTENSIONS.some((extension) => filename === `middleware${extension}`)
}

function firstExistingFile(
  dir: string,
  basename: string,
  extensions: readonly string[],
): string | undefined {
  return extensions
    .map((extension) => path.join(dir, `${basename}${extension}`))
    .find((file) => fs.existsSync(file))
}

function collectDirectories(appDir: string): string[] {
  const directories: string[] = []
  const walk = (dir: string) => {
    directories.push(dir)
    for (const name of fs.readdirSync(dir)) {
      const file = path.join(dir, name)
      if (fs.statSync(file).isDirectory()) walk(file)
    }
  }
  walk(appDir)
  return directories
}

export function scanRoutes(appDir: string): RouteManifestEntry[] {
  const entries: RouteManifestEntry[] = []
  const layouts = new Map<string, string>()
  const special = new Map<string, Partial<RouteManifestEntry>>()
  const directories = collectDirectories(appDir)

  for (const dir of directories) {
    const rel = path.relative(appDir, dir).split(path.sep).filter(Boolean)
    const folder = rel.join('/')
    const layout = firstExistingFile(dir, 'layout', PAGE_EXTENSIONS)
    if (layout) layouts.set(folder, layout)

    const current: Partial<RouteManifestEntry> = {}
    const loading = firstExistingFile(dir, 'loading', PAGE_EXTENSIONS)
    const error = firstExistingFile(dir, 'error', PAGE_EXTENSIONS)
    const notFound = firstExistingFile(dir, 'not-found', PAGE_EXTENSIONS)
    if (loading) current.loading = loading
    if (error) current.error = error
    if (notFound) current.notFound = notFound
    if (Object.keys(current).length > 0) special.set(folder, current)
  }

  for (const dir of directories) {
    const rel = path.relative(appDir, dir).split(path.sep).filter(Boolean)
    const folder = rel.join('/')
    const parentFolders = rel.map((_part: string, index: number) =>
      rel.slice(0, index + 1).join('/'),
    )
    const layout =
      [...parentFolders]
        .reverse()
        .map((key) => layouts.get(key))
        .find(Boolean) ?? layouts.get('')

    const page = firstExistingFile(dir, 'page', PAGE_EXTENSIONS)
    if (page) {
      entries.push({
        path: routePath(rel),
        file: page,
        component: page,
        layout,
        type: 'page',
        ...(special.get(folder) ?? {}),
      })
    }

    const route = firstExistingFile(dir, 'route', LOGIC_EXTENSIONS)
    if (route && rel[0] === 'api') {
      const parts = rel.slice(1)
      const apiPath = routePath(parts)
      entries.push({
        path: apiPath === '/' ? '/api' : `/api${apiPath}`,
        file: route,
        component: route,
        layout,
        type: 'api',
        ...(special.get(folder) ?? {}),
      })
    }
  }

  return entries.sort((a, b) => a.path.localeCompare(b.path))
}
