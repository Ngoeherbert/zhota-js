export interface WidgetProps { children?: unknown; class?: string; className?: string; style?: Record<string, unknown>; [key: string]: unknown }
export function widget(type: string, defaults: Record<string, unknown> = {}) {
  return function Widget(props: WidgetProps = {}) { return { type, props: { ...defaults, ...props } } }
}
