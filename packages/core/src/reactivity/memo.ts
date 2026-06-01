import { createSignal, type SignalGetter } from './signal'
import { createEffect } from './effect'

export function createMemo<T>(fn: () => T): SignalGetter<T> {
  let initialized = false
  const [value, setValue] = createSignal<T>(undefined as T)
  createEffect(() => {
    const next = fn()
    if (!initialized || !Object.is(next, value())) {
      initialized = true
      setValue(next)
    }
  })
  return value
}
