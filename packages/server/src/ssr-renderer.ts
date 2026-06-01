import { buildHtmlDocument } from './html-builder'

function attrs(props: Record<string, unknown>): string {
  return Object.entries(props).filter(([key]) => key !== 'children').map(([key, value]) => value === true ? ` ${key}` : value == null || value === false ? '' : ` ${key}="${String(value).replace(/"/g, '&quot;')}"`).join('')
}
export function renderNode(node: unknown): string {
  if (node == null || node === false || node === true) return ''
  if (Array.isArray(node)) return node.map(renderNode).join('')
  if (typeof node === 'function') return renderNode(node())
  if (typeof node !== 'object') return String(node).replace(/</g, '&lt;')
  const element = node as { type?: unknown; props?: Record<string, unknown> }
  if (typeof element.type === 'function') return renderNode(element.type(element.props ?? {}))
  if (typeof element.type === 'string') return `<${element.type}${attrs(element.props ?? {})}>${renderNode(element.props?.children)}</${element.type}>`
  return renderNode(element.props?.children)
}
export async function renderToString(component: unknown, props: Record<string, unknown> = {}): Promise<string> {
  const node = typeof component === 'function' ? await (component as (props: Record<string, unknown>) => unknown)(props) : component
  return renderNode(node)
}
export async function renderPage(component: unknown, props: Record<string, unknown> = {}): Promise<string> {
  const html = await renderToString(component, props)
  return buildHtmlDocument({ html, initialState: props })
}
