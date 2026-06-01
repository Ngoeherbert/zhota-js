export const Fragment = Symbol.for('lemine.fragment')
export type Component<P = Record<string, unknown>> = (props: P) => unknown
export type ElementType<P = Record<string, unknown>> = string | typeof Fragment | Component<P>
export interface LemineElement<P = Record<string, unknown>> { type: ElementType<P>; props: P; key?: string | number | undefined }

export function jsx<P extends Record<string, unknown>>(type: ElementType<P>, props: P, key?: string | number | undefined): LemineElement<P> {
  return { type, props: props ?? ({} as P), key }
}
export const jsxs = jsx
export const jsxDEV = jsx
