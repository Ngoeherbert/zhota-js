import { matchRoute } from './matcher'
import type { RouteManifestEntry, RouteMatch } from './route-types'
export function resolveServerRoute(url: string, manifest: RouteManifestEntry[]): RouteMatch { return matchRoute(url, manifest) }
