import { buildHtmlDocument } from './html-builder'
export function renderClientShell(bundle = '/client/runtime.js'): string { return buildHtmlDocument({ html: '', scripts: [bundle] }) }
