export interface TransformOptions { target?: 'client' | 'server'; development?: boolean }
export interface TransformResult { code: string; map?: unknown; serverActions: string[] }
export function transform(source: string, options: TransformOptions = {}): TransformResult {
  const serverActions: string[] = []
  let code = source
  if (source.includes("'use server'") || source.includes('"use server"')) {
    const regex = /export\s+async\s+function\s+(\w+)/g
    let match: RegExpExecArray | null
    while ((match = regex.exec(source))) serverActions.push(match[1]!)
    if (options.target === 'client') code = code.replace(/export\s+async\s+function\s+(\w+)\s*\(([^)]*)\)\s*{[\s\S]*?\n}/g, "export async function $1(...args) { return fetch('/__lemine/actions/$1', { method: 'POST', body: JSON.stringify(args) }).then(r => r.json()) }")
  }
  return { code, serverActions }
}
