export interface RouterState {
  path: string
  params: Record<string, string>
  query: Record<string, string>
  navigate: (path: string) => void
}

export function useRouter(): RouterState {
  const path = typeof location === 'undefined' ? '/' : location.pathname
  return {
    path,
    params: {},
    query: Object.fromEntries(typeof location === 'undefined' ? [] : new URLSearchParams(location.search)),
    navigate(to) {
      if (typeof history !== 'undefined') history.pushState({}, '', to)
    },
  }
}
