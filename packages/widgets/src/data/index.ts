import { widget } from '../factory'
export const Table = widget('table', { class: 'lemine-table' })
export const List = widget('ul', { class: 'lemine-list' })
export const Stat = widget('div', { class: 'lemine-stat' })
export const Tag = widget('span', { class: 'lemine-tag' })
export const Code = widget('code', { class: 'lemine-code' })
export const Head = widget('template', { class: 'lemine-head' })
export function Form(props: { action?: (formData: FormData) => unknown; children?: unknown; [key: string]: unknown }): unknown { return { type: 'form', props } }
