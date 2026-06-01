export interface CssBundle { css: string; files: string[] }
export function extractCss(files: Record<string, string>): CssBundle { return { files: Object.keys(files), css: Object.values(files).join('\n') } }
