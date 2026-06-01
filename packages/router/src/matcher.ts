import type { RouteManifestEntry, RouteMatch } from './route-types'

function matchPattern(pattern: string, path: string): Record<string, string> | undefined {
  const route = pattern.split('/').filter(Boolean)
  const url = path.split('/').filter(Boolean)
  const params: Record<string, string> = {}
  for (let i = 0; i < route.length; i += 1) {
    const segment = route[i]
    const value = url[i]
    if (segment === '*') { params.slug = url.slice(i).join('/'); return params }
    if (!value) return undefined
    if (segment?.startsWith(':')) params[segment.slice(1)] = decodeURIComponent(value)
    else if (segment !== value) return undefined
  }
  return route.length === url.length ? params : undefined
}

export function matchRoute(input: string, manifest: RouteManifestEntry[]): RouteMatch {
  const url = new URL(input, 'http://lumine.local')
  for (const route of manifest) {
    const params = matchPattern(route.path, url.pathname)
    if (params) return { route, params, query: Object.fromEntries(url.searchParams) }
  }
  return { params: {}, query: Object.fromEntries(url.searchParams) }
}
