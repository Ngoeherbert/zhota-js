export interface Ref<T> { current?: T | undefined }
export function useRef<T>(current?: T): Ref<T> { return current === undefined ? {} : { current } }
