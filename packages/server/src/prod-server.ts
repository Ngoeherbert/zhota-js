export interface ProdServer { url: string; close: () => Promise<void> }
export async function createProdServer(port = 3000): Promise<ProdServer> { return { url: `http://localhost:${port}`, async close() {} } }
