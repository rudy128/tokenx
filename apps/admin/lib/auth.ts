import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
// @ts-expect-error - Module resolution issue, file exists and works
import { prisma } from "./prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

// Extend the session type to include role
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
    }
  }
}

const AUTH_SECRET_VALUE = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET

if (!AUTH_SECRET_VALUE) {
  console.warn("⚠️ AUTH_SECRET not found, using fallback secret for development")
}

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  secret: AUTH_SECRET_VALUE || "dev-secret-admin-fallback-key-12345",
  trustHost: true,
  basePath: "/api/auth",
  providers: [
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("❌ Missing email or password")
            return null
          }

          const email = String(credentials.email).trim().toLowerCase()
          const password = String(credentials.password)

          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
              image: true,
            },
          })

          if (!user || !user.password) {
            console.log("❌ User not found or no password set")
            return null
          }

          // Check if user is admin
          if (user.role !== "ADMIN") {
            console.log("❌ User is not an admin")
            return null
          }

          // Verify password
          const isValid = await bcrypt.compare(password, user.password)

          if (!isValid) {
            console.log("❌ Invalid password")
            return null
          }

          console.log("✅ Admin authentication successful")
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          }
        } catch (error) {
          console.error("❌ Admin auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { id: string; role?: string }).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `admin.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
