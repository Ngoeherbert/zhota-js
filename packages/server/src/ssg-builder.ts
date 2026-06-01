import { renderPage } from './ssr-renderer'

type Fs = { mkdirSync(path: string, options?: { recursive?: boolean }): void; writeFileSync(path: string, data: string): void }
type Path = { dirname(path: string): string; join(...parts: string[]): string }
const load = (id: string): unknown => Function('id', 'return require(id)')(id)
const fs = load('node:fs') as Fs
const path = load('node:path') as Path

export async function buildStaticPage(routePath: string, component: unknown, outDir = '.lemine/static'): Promise<string> {
  const file = path.join(outDir, routePath === '/' ? 'index.html' : `${routePath.replace(/^\//, '')}.html`)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const html = await renderPage(component)
  fs.writeFileSync(file, html)
  return file
}
