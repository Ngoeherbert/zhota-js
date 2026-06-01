const stalePaths = new Set<string>()
const staleTags = new Set<string>()
export function revalidatePath(path: string): void { stalePaths.add(path) }
export function revalidateTag(tag: string): void { staleTags.add(tag) }
export function isPathStale(path: string): boolean { return stalePaths.has(path) }
export function isTagStale(tag: string): boolean { return staleTags.has(tag) }
export function redirect(path: string): never { throw Object.assign(new Error('Redirect'), { status: 302, location: path }) }
export function notFound(): never { throw Object.assign(new Error('Not Found'), { status: 404 }) }
