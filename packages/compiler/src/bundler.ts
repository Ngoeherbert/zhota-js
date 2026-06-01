export interface BuildManifest { routes: Record<string, string[]>; server: string[]; client: string[] }
export async function bundle(): Promise<BuildManifest> { return { routes: {}, server: ['server/server.js'], client: ['client/runtime.js'] } }
