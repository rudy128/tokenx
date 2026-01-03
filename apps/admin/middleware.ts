import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { UserRole } from "@prisma/client"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to sign-in page, unauthorized page, clear-cookies page, and ALL API routes (including auth)
  if (
    pathname === "/sign-in" || 
    pathname === "/unauthorized" || 
    pathname === "/clear-cookies" || 
    pathname.startsWith("/api/")
  ) {
    return NextResponse.next()
  }

  // Also allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes("/favicon")
  ) {
    return NextResponse.next()
  }

  // Check if there are any client app cookies that shouldn't be here
  const adminCookieName = process.env.NODE_ENV === "production" 
    ? "__Secure-admin.session-token"
    : "admin.session-token"
  
  const hasClientCookie = request.cookies.has("next-auth.session-token") || 
                          request.cookies.has("__Secure-next-auth.session-token")
  
  if (hasClientCookie && !request.cookies.has(adminCookieName)) {
    // Clear client cookies and redirect to sign-in
    console.log("⚠️ Detected client app cookies, clearing...")
    const signInUrl = new URL("/sign-in", request.url)
    signInUrl.searchParams.set("error", "session_mismatch")
    const response = NextResponse.redirect(signInUrl)
    
    response.cookies.delete("next-auth.session-token")
    response.cookies.delete("__Secure-next-auth.session-token")
    
    return response
  }

  // Check authentication for all other routes
  let session
  try {
    session = await auth()
  } catch (error) {
    // If there's a JWT error (e.g., invalid token), clear cookies and redirect to sign-in
    console.error("❌ Auth error in middleware:", error)
    
    const signInUrl = new URL("/sign-in", request.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    const response = NextResponse.redirect(signInUrl)
    
    // Clear all potential session cookies
    response.cookies.delete("admin.session-token")
    response.cookies.delete("__Secure-admin.session-token")
    response.cookies.delete("next-auth.session-token")
    response.cookies.delete("__Secure-next-auth.session-token")
    
    return response
  }

  if (!session?.user) {
    console.log(`⚠️ No session found for ${pathname}`)
    
    // Prevent redirect loop - if already going to sign-in, don't redirect again
    if (pathname === "/sign-in") {
      return NextResponse.next()
    }
    
    // Redirect to sign-in if not authenticated
    const signInUrl = new URL("/sign-in", request.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  console.log(`✅ Session found for ${pathname}, user: ${session.user.email}`)

  // Check if user is admin
  const user = session.user as { id: string; role?: UserRole }
  if (user.role !== UserRole.ADMIN) {
    // Redirect to unauthorized page or client app
    return NextResponse.redirect(new URL("/unauthorized", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
