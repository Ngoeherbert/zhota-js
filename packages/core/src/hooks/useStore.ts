import { createSignal } from '../reactivity'

export type Store<T extends object> = T

export function createStore<T extends object>(initialState: T): Store<T> {
  const signals = new Map<PropertyKey, ReturnType<typeof createSignal<unknown>>>()
  const ensure = (key: PropertyKey, value: unknown) => {
    if (!signals.has(key)) signals.set(key, createSignal(value))
    return signals.get(key)!
  }
  return new Proxy({ ...initialState } as T, {
    get(target, key) {
      return ensure(key, Reflect.get(target, key))[0]()
    },
    set(target, key, value) {
      Reflect.set(target, key, value)
      ensure(key, value)[1](value)
      return true
    },
  })
}

export function useStore<T extends object>(store: Store<T>): Store<T> { return store }
