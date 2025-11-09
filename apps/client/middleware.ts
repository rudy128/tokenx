import { NextResponse, type NextRequest } from "next/server"

// For NextAuth v5 beta, we'll use a simpler approach
// The auth check will happen on the client side after login
export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  
  // Allow all API routes and static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  // Allow public routes
  const isPublicRoute = pathname === "/" || pathname.startsWith("/auth")
  
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // For protected routes, check if session cookie exists
  const sessionCookie = req.cookies.get('authjs.session-token') || req.cookies.get('__Secure-authjs.session-token')
  
  if (!sessionCookie) {
    console.log(`[Middleware] No session cookie found, redirecting to /auth/signin`)
    return NextResponse.redirect(new URL("/auth/signin", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - but we still want to check api/auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}