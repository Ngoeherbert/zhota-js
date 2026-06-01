import ts from 'typescript'

export interface TransformOptions {
  target?: 'client' | 'server'
  development?: boolean
}
export interface TransformResult {
  code: string
  map?: unknown
  serverActions: string[]
}

const JSX_EXTENSIONS = ['.jsx', '.tsx', '.js']
const TS_EXTENSIONS = ['.ts', '.tsx']

function extname(filePath: string): string {
  const cleanPath = filePath.split(/[?#]/, 1)[0] ?? filePath
  const index = cleanPath.lastIndexOf('.')
  return index >= 0 ? cleanPath.slice(index) : ''
}

function compileSource(
  source: string,
  filePath: string,
  needsJSXTransform: boolean,
  needsTSStrip: boolean,
): string {
  if (!needsJSXTransform && !needsTSStrip) return source
  return ts
    .transpileModule(source, {
      fileName: filePath,
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ESNext,
        jsx: ts.JsxEmit.ReactJSX,
        jsxImportSource: '@luminejs/core',
        sourceMap: false,
      },
      reportDiagnostics: false,
    })
    .outputText.trimEnd()
}

function collectServerActions(source: string): string[] {
  if (!source.includes("'use server'") && !source.includes('"use server"')) return []
  const serverActions: string[] = []
  const regex = /export\s+async\s+function\s+(\w+)/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(source))) serverActions.push(match[1]!)
  return serverActions
}

function transformServerActions(code: string, target?: 'client' | 'server'): string {
  if (target !== 'client') return code
  return code.replace(
    /export\s+async\s+function\s+(\w+)\s*\(([^)]*)\)\s*{[\s\S]*?\n}/g,
    "export async function $1(...args) { return fetch('/__lemine/actions/$1', { method: 'POST', body: JSON.stringify(args) }).then(r => r.json()) }",
  )
}

export function transform(
  source: string,
  filePathOrOptions: string | TransformOptions = {},
  options: TransformOptions = {},
): TransformResult {
  const filePath = typeof filePathOrOptions === 'string' ? filePathOrOptions : 'module.tsx'
  const transformOptions = typeof filePathOrOptions === 'string' ? options : filePathOrOptions
  const extension = extname(filePath)
  const needsJSXTransform = JSX_EXTENSIONS.includes(extension)
  const needsTSStrip = TS_EXTENSIONS.includes(extension)
  const needsServerTransform = true

  const serverActions = needsServerTransform ? collectServerActions(source) : []
  let code = compileSource(source, filePath, needsJSXTransform, needsTSStrip)
  if (serverActions.length > 0) code = transformServerActions(code, transformOptions.target)

  return { code, serverActions }
}
