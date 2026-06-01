export const tokens = {
  colors: { primary: '#635bff', background: '#ffffff', foreground: '#111827', muted: '#6b7280', danger: '#ef4444', success: '#22c55e' },
  spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem' },
  radii: { sm: '0.25rem', md: '0.5rem', lg: '1rem', full: '9999px' },
  shadows: { sm: '0 1px 2px rgb(0 0 0 / 0.08)', md: '0 8px 24px rgb(0 0 0 / 0.12)' },
} as const
export type Theme = typeof tokens
export function serverTokens(): Theme { return tokens }
