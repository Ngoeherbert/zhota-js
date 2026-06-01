import { createReactiveAttr, createReactiveTextNode } from './dom-helpers'
import { Fragment, type LumineElement } from './jsx-runtime'

function isElement(value: unknown): value is LumineElement { return !!value && typeof value === 'object' && 'type' in value }

export function toNode(value: unknown): Node {
  if (value == null || value === false || value === true) return document.createTextNode('')
  if (value instanceof Node) return value
  if (Array.isArray(value)) {
    const fragment = document.createDocumentFragment()
    for (const child of value) fragment.append(toNode(child))
    return fragment
  }
  if (typeof value === 'function') return createReactiveTextNode(value as () => unknown)
  if (!isElement(value)) return document.createTextNode(String(value))
  if (value.type === Fragment) return toNode((value.props as { children?: unknown }).children)
  if (typeof value.type === 'function') return toNode(value.type(value.props))
  const el = document.createElement(value.type)
  const props = value.props as Record<string, unknown>
  for (const [key, prop] of Object.entries(props)) {
    if (key === 'children') continue
    if (key === 'style' && prop && typeof prop === 'object') {
      for (const [styleKey, styleValue] of Object.entries(prop as Record<string, unknown>)) {
        ;(el as HTMLElement).style.setProperty(styleKey, String(typeof styleValue === 'function' ? styleValue() : styleValue))
      }
    } else createReactiveAttr(el, key, prop)
  }
  el.append(toNode(props.children))
  return el
}

export function render(component: unknown, container: Element): () => void {
  container.replaceChildren(toNode(typeof component === 'function' ? component() : component))
  return () => container.replaceChildren()
}
