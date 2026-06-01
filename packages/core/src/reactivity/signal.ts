import { notifySubscribers, trackDependency, type Computation } from './effect'

export type SignalGetter<T> = (() => T) & { readonly value: T }
export type SignalSetter<T> = (value: T | ((previous: T) => T)) => T
export type Signal<T> = [SignalGetter<T>, SignalSetter<T>]

export function createSignal<T>(initialValue: T): Signal<T> {
  let value = initialValue
  const subscribers = new Set<Computation>()
  const getter = (() => {
    trackDependency(subscribers)
    return value
  }) as SignalGetter<T>
  Object.defineProperty(getter, 'value', {
    enumerable: true,
    get: getter,
  })
  const setter: SignalSetter<T> = (next) => {
    const nextValue = typeof next === 'function' ? (next as (previous: T) => T)(value) : next
    if (Object.is(nextValue, value)) return value
    value = nextValue
    notifySubscribers(subscribers)
    return value
  }
  return [getter, setter]
}
