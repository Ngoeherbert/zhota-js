import type { LumineRequest } from './route-handler'
export type Middleware = (request: LumineRequest) => Response | void | Promise<Response | void>
export async function runMiddleware(request: LumineRequest, middleware: Middleware[]): Promise<Response | undefined> {
  for (const fn of middleware) { const response = await fn(request); if (response) return response }
  return undefined
}
