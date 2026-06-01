import type { LemineRequest } from './route-handler'
export type Middleware = (request: LemineRequest) => Response | void | Promise<Response | void>
export async function runMiddleware(request: LemineRequest, middleware: Middleware[]): Promise<Response | undefined> {
  for (const fn of middleware) { const response = await fn(request); if (response) return response }
  return undefined
}
