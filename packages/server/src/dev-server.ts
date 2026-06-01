export interface DevServer { url: string; close: () => Promise<void> }
export async function createDevServer(port = 3000): Promise<DevServer> { return { url: `http://localhost:${port}`, async close() {} } }
