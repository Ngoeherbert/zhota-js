export type LemineVitePluginOptions = {
  appDir?: string
  injectGlobalStyles?: boolean
  devOverlay?: boolean
}

type VitePlugin = {
  name: string
  enforce?: 'pre' | 'post'
  config?: () => Record<string, unknown>
  transform?: (code: string, id: string) => { code: string; map: null } | null
  configureServer?: (server: { watcher?: { add: (path: string) => void } }) => void
}

const serverActionPattern = /(['"]use server['"])/
const clientDirectivePattern = /(['"]use client['"])/

export function lemine(options: LemineVitePluginOptions = {}): VitePlugin {
  const appDir = options.appDir ?? 'app'
  return {
    name: 'lemine:vite-plugin',
    enforce: 'pre',
    config() {
      return {
        esbuild: {
          jsx: 'automatic',
          jsxImportSource: '@leminejs/core',
        },
        optimizeDeps: {
          include: ['@leminejs/core', '@leminejs/widgets', '@leminejs/router'],
        },
      }
    },
    transform(code, id) {
      if (!/\.[tj]sx?$/.test(id)) return null
      let transformed = code
      if (serverActionPattern.test(code)) {
        transformed = transformed.replace(
          /export\s+async\s+function\s+(\w+)\s*\([^)]*\)\s*{[\s\S]*?\n}/g,
          "export async function $1(...args) { return fetch('/__lemine/actions/$1', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(args) }).then((response) => response.json()) }",
        )
      }
      if (clientDirectivePattern.test(code)) {
        transformed += '\nimport.meta.hot?.accept?.()\n'
      }
      return transformed === code ? null : { code: transformed, map: null }
    },
    configureServer(server) {
      server.watcher?.add(appDir)
    },
  }
}

export default lemine
