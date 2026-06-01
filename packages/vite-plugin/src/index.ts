export type LumineVitePluginOptions = {
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

export function lumine(options: LumineVitePluginOptions = {}): VitePlugin {
  const appDir = options.appDir ?? 'app'
  return {
    name: 'lumine:vite-plugin',
    enforce: 'pre',
    config() {
      return {
        esbuild: {
          jsx: 'automatic',
          jsxImportSource: '@luminejs/core',
        },
        optimizeDeps: {
          include: ['@luminejs/core', '@luminejs/widgets', '@luminejs/router'],
        },
      }
    },
    transform(code, id) {
      if (!/\.[tj]sx?$/.test(id)) return null
      let transformed = code
      if (serverActionPattern.test(code)) {
        transformed = transformed.replace(
          /export\s+async\s+function\s+(\w+)\s*\([^)]*\)\s*{[\s\S]*?\n}/g,
          "export async function $1(...args) { return fetch('/__lumine/actions/$1', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(args) }).then((response) => response.json()) }",
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

export default lumine
