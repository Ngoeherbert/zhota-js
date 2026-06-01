export type Cleanup = void | (() => void)
export type EffectCallback = () => Cleanup

export interface Computation {
  run(): void
  dispose(): void
  dependencies: Set<Set<Computation>>
  disposed: boolean
}

const trackingStack: Computation[] = []
let batchDepth = 0
const pendingComputations = new Set<Computation>()

export function currentComputation(): Computation | undefined {
  return trackingStack[trackingStack.length - 1]
}

export function trackDependency(subscribers: Set<Computation>): void {
  const computation = currentComputation()
  if (!computation || computation.disposed) return
  subscribers.add(computation)
  computation.dependencies.add(subscribers)
}

export function notifySubscribers(subscribers: Set<Computation>): void {
  for (const computation of [...subscribers]) {
    if (computation.disposed) continue
    if (batchDepth > 0) pendingComputations.add(computation)
    else computation.run()
  }
}

export function startBatch(): void {
  batchDepth += 1
}

export function endBatch(): void {
  batchDepth -= 1
  if (batchDepth > 0) return
  const queued = [...pendingComputations]
  pendingComputations.clear()
  for (const computation of queued) computation.run()
}

function clearDependencies(computation: Computation): void {
  for (const dependency of computation.dependencies) dependency.delete(computation)
  computation.dependencies.clear()
}

export function createComputation(fn: EffectCallback): Computation {
  let cleanup: Cleanup
  const computation: Computation = {
    dependencies: new Set(),
    disposed: false,
    run() {
      if (computation.disposed) return
      if (typeof cleanup === 'function') cleanup()
      clearDependencies(computation)
      trackingStack.push(computation)
      try {
        cleanup = fn()
      } finally {
        trackingStack.pop()
      }
    },
    dispose() {
      if (computation.disposed) return
      computation.disposed = true
      if (typeof cleanup === 'function') cleanup()
      clearDependencies(computation)
    },
  }
  return computation
}

export function createEffect(fn: EffectCallback): () => void {
  const computation = createComputation(fn)
  computation.run()
  return computation.dispose
}
