export type DataContext = { params?: Record<string, string>; query?: Record<string, string>; request?: Request }
export async function loadPageData(module: { getData?: (context: DataContext) => unknown }, context: DataContext): Promise<Record<string, unknown>> {
  return module.getData ? ((await module.getData(context)) as Record<string, unknown>) : {}
}
