export type ServerAction = (...args: unknown[]) => unknown | Promise<unknown>
const actions = new Map<string, ServerAction>()
export function registerServerAction(id: string, action: ServerAction): void { actions.set(id, action) }
export async function callServerAction<T = unknown>(id: string, args: unknown[] = []): Promise<T> {
  const action = actions.get(id)
  if (!action) throw new Error(`Unknown server action: ${id}`)
  return (await action(...args)) as T
}
