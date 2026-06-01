export function middleware(req) {
  const token = req.cookies.get('auth-token')
  if (!token) {
    return Response.redirect('/login')
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/user/:path*'],
}
