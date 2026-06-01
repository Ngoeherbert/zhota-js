import { jsx } from './jsx-runtime'

export function Show(props: { when: unknown; fallback?: unknown; children?: unknown }): unknown {
  const value = typeof props.when === 'function' ? (props.when as () => unknown)() : props.when
  return value ? props.children : props.fallback
}
export function For<T>(props: { each: T[] | (() => T[]); fallback?: unknown; children: (item: T, index: number) => unknown }): unknown {
  const list = typeof props.each === 'function' ? props.each() : props.each
  return list.length ? list.map((item, index) => props.children(item, index)) : props.fallback
}
export function Match(props: { when: unknown; children?: unknown }): unknown { return props.when ? props.children : undefined }
export function Switch(props: { fallback?: unknown; children?: unknown[] }): unknown { return props.children?.find(Boolean) ?? props.fallback }
export function Portal(props: { target: Element; children?: unknown }): unknown { props.target.append(String(props.children ?? '')); return undefined }
export function Dynamic(props: { component: string | ((props: Record<string, unknown>) => unknown); [key: string]: unknown }): unknown {
  const { component, ...rest } = props
  return jsx(component as never, rest)
}
