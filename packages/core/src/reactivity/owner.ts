export interface Owner {
  parent?: Owner | undefined
  children: Set<Owner>
  cleanups: Set<() => void>
  disposed: boolean
}

let current: Owner | undefined

export function getOwner(): Owner | undefined {
  return current
}

export function createOwner(parent = current): Owner {
  const owner: Owner = { parent, children: new Set(), cleanups: new Set(), disposed: false }
  parent?.children.add(owner)
  return owner
}

export function runWithOwner<T>(owner: Owner, fn: () => T): T {
  const previous = current
  current = owner
  try {
    return fn()
  } finally {
    current = previous
  }
}

export function onCleanup(cleanup: () => void): void {
  current?.cleanups.add(cleanup)
}

export function disposeOwner(owner: Owner): void {
  if (owner.disposed) return
  owner.disposed = true
  for (const child of [...owner.children]) disposeOwner(child)
  for (const cleanup of [...owner.cleanups]) cleanup()
  owner.children.clear()
  owner.cleanups.clear()
  owner.parent?.children.delete(owner)
}
