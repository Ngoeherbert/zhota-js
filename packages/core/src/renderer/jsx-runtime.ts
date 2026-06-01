export const Fragment = Symbol.for('lumine.fragment')
export type Component<P = Record<string, unknown>> = (props: P) => unknown
export type ElementType<P = Record<string, unknown>> = string | typeof Fragment | Component<P>
export interface LumineElement<P = Record<string, unknown>> { type: ElementType<P>; props: P; key?: string | number | undefined }

export function jsx<P extends Record<string, unknown>>(type: ElementType<P>, props: P, key?: string | number | undefined): LumineElement<P> {
  return { type, props: props ?? ({} as P), key }
}
export const jsxs = jsx
export const jsxDEV = jsx
