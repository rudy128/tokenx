import NextAuth from "next-auth"
import type { Session } from "next-auth"
import type { JWT } from "next-auth/jwt"
import type { NextAuthConfig } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { validateEmailInput, safePrismaUserFind } from "@/lib/env-debug"

// Extend the session user type to include id
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

// Resolve secret: prefer AUTH_SECRET, then NEXTAUTH_SECRET.
const AUTH_SECRET_VALUE = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
if (!AUTH_SECRET_VALUE && process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line no-console
  console.warn(
    "[auth] No AUTH_SECRET or NEXTAUTH_SECRET set — using development fallback secret. Do not use in production."
  )
}

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  // Prefer AUTH_SECRET, fall back to NEXTAUTH_SECRET for compatibility.
  // If neither is present, use a dev fallback to avoid MissingSecret errors during local dev.
  secret:
    AUTH_SECRET_VALUE || (process.env.NODE_ENV === "production" ? undefined : "dev-secret-please-change"),
  trustHost: true,
  basePath: "/api/auth",
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // Keep the authorize signature permissive to match provider typings across versions
      async authorize(credentials: any, _req: any) {
        try {
          console.log("🔍 NextAuth credentials authorize starting...")

          // Step 2: Validate email input
          const emailValidation = validateEmailInput(credentials?.email)
          if (!emailValidation.isValid) {
            console.log("❌ Email validation failed:", emailValidation.error)
            return null
          }

          // Step 2: Validate password input
          const password = credentials?.password
          if (!password || password.trim() === "") {
            console.log("❌ Password validation failed: missing or empty")
            return null
          }

          // Step 3: Safe Prisma user lookup with comprehensive error handling
          const { user, success, error } = await safePrismaUserFind(emailValidation.sanitized!)

          if (!success) {
            console.error("❌ Database lookup failed:", error)
            return null
          }

          if (!user || !user.password) {
            console.log("❌ User not found or no password set")
            return null
          }

          // Step 3: Password verification with try-catch
          let isValid: boolean
          try {
            isValid = await bcrypt.compare(password, user.password)
          } catch (bcryptError) {
            console.error("❌ Password comparison failed:", bcryptError)
            return null
          }

          if (!isValid) {
            console.log("❌ Password verification failed")
            return null
          }

          console.log("✅ User authentication successful")
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          }
        } catch (error) {
          console.error("❌ NextAuth authorize error:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt(params: { token: JWT; user?: any }) {
      const { token, user } = params
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session(params: { session: Session; token: JWT }) {
      const { session, token } = params
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  }
}

// Create NextAuth instance
const nextAuthResult = NextAuth(authConfig)

// Export handlers
export const handlers = nextAuthResult.handlers

// Export other functions with explicit any typing to avoid inference issues
export const auth = nextAuthResult.auth as any
export const signIn = nextAuthResult.signIn as any
export const signOut = nextAuthResult.signOut as any