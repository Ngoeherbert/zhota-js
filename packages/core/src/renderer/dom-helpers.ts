import { createEffect } from '../reactivity'

export type Reactive<T> = T | (() => T)
const isReactive = <T>(value: Reactive<T>): value is () => T => typeof value === 'function'

export function createReactiveTextNode(value: Reactive<unknown>): Text {
  const node = document.createTextNode(String(isReactive(value) ? value() : value ?? ''))
  if (isReactive(value)) createEffect(() => { node.data = String(value() ?? '') })
  return node
}

export function createReactiveAttr(el: Element, attr: string, value: Reactive<unknown>): void {
  if (isReactive(value)) createEffect(() => setAttr(el, attr, value()))
  else setAttr(el, attr, value)
}

export function createReactiveStyle(el: HTMLElement, prop: string, value: Reactive<unknown>): void {
  if (isReactive(value)) createEffect(() => { el.style.setProperty(prop, String(value() ?? '')) })
  else el.style.setProperty(prop, String(value ?? ''))
}

export function setAttr(el: Element, key: string, value: unknown): void {
  if (key === 'children' || key === 'key') return
  if (key === 'ref') {
    if (typeof value === 'function') value(el)
    else if (value && typeof value === 'object') (value as { current?: Element }).current = el
    return
  }
  if (key === 'className') key = 'class'
  if (key.startsWith('on') && typeof value === 'function') {
    el.addEventListener(key.slice(2).toLowerCase(), value as EventListener)
    return
  }
  if (value === false || value == null) el.removeAttribute(key)
  else if (value === true) el.setAttribute(key, '')
  else el.setAttribute(key, String(value))
}
