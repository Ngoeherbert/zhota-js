import { matchRoute } from './matcher'
import type { RouteManifestEntry, RouteMatch } from './route-types'

let currentRoute: RouteMatch = { params: {}, query: {} }
export function RouterProvider(props: { manifest: RouteManifestEntry[]; children?: unknown }): unknown {
  currentRoute = matchRoute(globalThis.location?.href ?? '/', props.manifest)
  globalThis.addEventListener?.('popstate', () => { currentRoute = matchRoute(location.href, props.manifest) })
  return props.children
}
export function useRoute(): RouteMatch { return currentRoute }
export function Link(props: { href: string; children?: unknown; prefetch?: boolean }): unknown { return { type: 'a', props } }
export function Outlet(props: { children?: unknown }): unknown { return props.children }
export function navigate(path: string): void { history.pushState({}, '', path); dispatchEvent(new PopStateEvent('popstate')) }
