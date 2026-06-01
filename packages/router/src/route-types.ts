export type RouteType = 'page' | 'api'
export interface RouteManifestEntry {
  path: string
  file: string
  component?: string | undefined
  layout?: string | undefined
  loading?: string | undefined
  error?: string | undefined
  notFound?: string | undefined
  type: RouteType
}
export interface RouteMatch { route?: RouteManifestEntry | undefined; params: Record<string, string>; query: Record<string, string> }
