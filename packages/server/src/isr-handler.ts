export interface CacheEntry { html: string; generatedAt: number; revalidate: number; regenerating?: boolean }
const cache = new Map<string, CacheEntry>()
export function getCachedPage(path: string): CacheEntry | undefined { return cache.get(path) }
export function setCachedPage(path: string, entry: CacheEntry): void { cache.set(path, entry) }
export function isStale(entry: CacheEntry, now = Date.now()): boolean { return now - entry.generatedAt > entry.revalidate * 1000 }
export async function handleIsr(path: string, render: () => Promise<string>, revalidate: number): Promise<string> {
  const entry = cache.get(path)
  if (!entry) { const html = await render(); cache.set(path, { html, generatedAt: Date.now(), revalidate }); return html }
  if (isStale(entry) && !entry.regenerating) { entry.regenerating = true; void render().then((html) => cache.set(path, { html, generatedAt: Date.now(), revalidate })) }
  return entry.html
}
