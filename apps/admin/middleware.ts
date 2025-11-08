import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to sign-in page, unauthorized page, and clear-cookies page
  if (pathname === "/sign-in" || pathname === "/unauthorized" || pathname === "/clear-cookies") {
    return NextResponse.next()
  }

  // Check if there are any client app cookies that shouldn't be here
  const hasClientCookie = request.cookies.has("next-auth.session-token") || 
                          request.cookies.has("__Secure-next-auth.session-token")
  
  if (hasClientCookie && !request.cookies.has("admin.session-token")) {
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
    
    // Only redirect if we're not already on the sign-in page
    if (pathname !== "/sign-in") {
      const signInUrl = new URL("/sign-in", request.url)
      signInUrl.searchParams.set("callbackUrl", pathname)
      const response = NextResponse.redirect(signInUrl)
      
      // Clear all potential session cookies
      response.cookies.delete("admin.session-token")
      response.cookies.delete("next-auth.session-token")
      response.cookies.delete("__Secure-next-auth.session-token")
      
      return response
    }
    
    // If we're already on sign-in, just continue
    return NextResponse.next()
  }

  if (!session?.user) {
    // Redirect to sign-in if not authenticated
    const signInUrl = new URL("/sign-in", request.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Check if user is admin
  const user = session.user as { id: string; role?: string }
  if (user.role !== "ADMIN") {
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
