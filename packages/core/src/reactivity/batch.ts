import { endBatch, startBatch } from './effect'

export function batch<T>(fn: () => T): T {
  startBatch()
  try {
    return fn()
  } finally {
    endBatch()
  }
}
