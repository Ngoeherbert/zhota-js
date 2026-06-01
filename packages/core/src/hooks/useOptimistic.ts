import { createSignal } from '../reactivity'

export function useOptimistic<T>(initialValue: T): [() => T, (value: T | ((previous: T) => T)) => void] {
  const [value, setValue] = createSignal(initialValue)
  return [value, (next) => { setValue(next) }]
}
