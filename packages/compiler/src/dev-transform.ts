import { transform, type TransformResult } from './transform'
export function transformForDev(source: string): TransformResult { return transform(source, { development: true }) }
