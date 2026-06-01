export function optimizeCode(code: string): string { return code.replace(/\/\*#__PURE__\*\//g, '').trim() }
export function inlineTokens(css: string, tokens: Record<string, string>): string { return css.replace(/var\(--([^)]+)\)/g, (_, key) => tokens[key] ?? `var(--${key})`) }
