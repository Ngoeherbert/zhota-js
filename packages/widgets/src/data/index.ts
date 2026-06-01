import { widget } from '../factory'
export const Table = widget('table', { class: 'lumine-table' })
export const List = widget('ul', { class: 'lumine-list' })
export const Stat = widget('div', { class: 'lumine-stat' })
export const Tag = widget('span', { class: 'lumine-tag' })
export const Code = widget('code', { class: 'lumine-code' })
export const Head = widget('template', { class: 'lumine-head' })
export function Form(props: { action?: (formData: FormData) => unknown; children?: unknown; [key: string]: unknown }): unknown { return { type: 'form', props } }
