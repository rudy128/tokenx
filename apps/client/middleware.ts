import { NextResponse, type NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  try {
    const token = await getToken({
      req: req as any,
      secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
    })
    const isLoggedIn = Boolean(token)

    // Fix: Define pathname here
    const pathname = req.nextUrl.pathname

    const isPublicRoute = pathname === "/" || pathname.startsWith("/auth")
    const isAuthRoute = pathname.startsWith("/auth")

    // Redirect logged-in users away from auth pages
    if (isAuthRoute && isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Redirect non-logged-in users to signin for protected routes
    if (!isLoggedIn && !isPublicRoute) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    return NextResponse.next()
 } catch (error) {
    console.error("Middleware error:", error)
    return NextResponse.redirect(new URL("/auth/signin", req.url))
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|auth).*)",
  ],
}