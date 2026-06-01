export interface Context<T> {
  id: symbol
  defaultValue: T
  Provider: (props: { value: T; children?: unknown }) => unknown
}

const values = new Map<symbol, unknown[]>()

export function createContext<T>(defaultValue: T): Context<T> {
  const id = Symbol('LemineContext')
  return {
    id,
    defaultValue,
    Provider({ value, children }) {
      const stack = values.get(id) ?? []
      stack.push(value)
      values.set(id, stack)
      return children
    },
  }
}

export function useContext<T>(context: Context<T>): T {
  const stack = values.get(context.id)
  return stack && stack.length > 0 ? (stack[stack.length - 1] as T) : context.defaultValue
}
