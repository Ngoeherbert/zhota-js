export interface HtmlOptions { html: string; head?: string[]; scripts?: string[]; styles?: string[]; initialState?: unknown }
export function buildHtmlDocument(options: HtmlOptions): string {
  const state = options.initialState === undefined ? '' : `<script>globalThis.__LEMINE_STATE__=${JSON.stringify(options.initialState)}</script>`
  const styles = (options.styles ?? []).map((href) => `<link rel="stylesheet" href="${href}">`).join('')
  const scripts = (options.scripts ?? []).map((src) => `<script type="module" src="${src}"></script>`).join('')
  return `<!DOCTYPE html><html><head>${(options.head ?? []).join('')}${styles}${state}</head><body><div id="root">${options.html}</div>${scripts}</body></html>`
}
