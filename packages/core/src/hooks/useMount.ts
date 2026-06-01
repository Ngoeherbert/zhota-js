export function useMount(fn: () => void): void {
  if (typeof queueMicrotask === 'function') queueMicrotask(fn)
  else Promise.resolve().then(fn)
}
