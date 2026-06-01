export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'
export interface LemineRequest extends Request { params: Record<string, string>; cookies: Map<string, string> }
export type RouteModule = Partial<Record<HttpMethod, (request: LemineRequest) => Response | Promise<Response>>>
export function createLemineRequest(request: Request, params: Record<string, string> = {}): LemineRequest {
  const cookies = new Map((request.headers.get('cookie') ?? '').split(';').filter(Boolean).map((part) => { const [key, ...value] = part.trim().split('='); return [key ?? '', value.join('=')] }))
  return Object.assign(request, { params, cookies })
}
export async function handleApiRoute(module: RouteModule, request: Request, params: Record<string, string> = {}): Promise<Response> {
  const method = request.method.toUpperCase() as HttpMethod
  const handler = module[method]
  if (!handler) return new Response('Method Not Allowed', { status: 405 })
  return handler(createLemineRequest(request, params))
}
