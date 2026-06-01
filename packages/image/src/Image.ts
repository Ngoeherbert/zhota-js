export interface ImageProps { src: string; alt: string; width: number; height: number; priority?: boolean; quality?: number; placeholder?: 'blur' | 'empty' }
export function Image(props: ImageProps): { type: 'img'; props: Record<string, unknown> } {
  return { type: 'img', props: { ...props, loading: props.priority ? 'eager' : 'lazy', decoding: 'async' } }
}
