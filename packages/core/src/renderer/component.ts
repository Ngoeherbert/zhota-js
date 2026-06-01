import { createOwner, disposeOwner, runWithOwner, type Owner } from '../reactivity'
import type { Component } from './jsx-runtime'

export interface ComponentInstance { owner: Owner; value: unknown; dispose: () => void }

export function runComponent<P>(component: Component<P>, props: P): ComponentInstance {
  const owner = createOwner()
  const value = runWithOwner(owner, () => component(props))
  return { owner, value, dispose: () => disposeOwner(owner) }
}
