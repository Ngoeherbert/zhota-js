import { tokens, type Theme } from './index'
let currentTheme: Theme = tokens
export function ThemeProvider(props: { theme?: Theme; children?: unknown }): unknown { currentTheme = props.theme ?? tokens; return props.children }
export function useTheme(): Theme { return currentTheme }
