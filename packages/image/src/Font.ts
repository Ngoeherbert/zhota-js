export interface FontConfig { family: string; src: string; weight?: string; display?: string; preload?: boolean }
export function fontFace(font: FontConfig): string { return `@font-face{font-family:${font.family};src:url(${font.src});font-weight:${font.weight ?? '400'};font-display:${font.display ?? 'swap'}}` }
