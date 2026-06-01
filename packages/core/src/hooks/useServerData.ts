import { createSignal } from '../reactivity'

export interface ServerData<T> {
  data: () => T | undefined
  loading: () => boolean
  error: () => unknown
  refetch: () => Promise<T | undefined>
}

export function useServerData<T>(loader: () => Promise<T>): ServerData<T> {
  const [data, setData] = createSignal<T | undefined>(undefined)
  const [loading, setLoading] = createSignal(false)
  const [error, setError] = createSignal<unknown>(undefined)
  async function refetch() {
    setLoading(true)
    setError(undefined)
    try {
      const result = await loader()
      setData(result)
      return result
    } catch (err) {
      setError(err)
      return undefined
    } finally {
      setLoading(false)
    }
  }
  void refetch()
  return { data, loading, error, refetch }
}
