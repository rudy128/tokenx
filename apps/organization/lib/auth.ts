import NextAuth, { type DefaultSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@repo/prisma";
import bcrypt from "bcryptjs";
import type { JWT } from "next-auth/jwt";

// Extend the session type to include organization member info
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      organizationId: string;
      role: string;
      organizationName?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email?: string | null;
    organizationId: string;
    role: string;
    organizationName?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email?: string | null;
    organizationId: string;
    role: string;
    organizationName?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Organization Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials");
          return null;
        }

        try {
          // Find organization member by user email
          const member = await prisma.organizationMember.findFirst({
            where: {
              user: {
                email: credentials.email as string,
              },
            },
            select: {
              id: true,
              organizationId: true,
              role: true,
              passwordHash: true,
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
              organization: {
                select: {
                  id: true,
                  name: true,
                  status: true,
                },
              },
            },
          });

          if (!member) {
            console.log("❌ Organization member not found");
            return null;
          }

          // Check if organization is active
          if (member.organization.status !== "ACTIVE") {
            console.log("❌ Organization is not active");
            return null;
          }

          // Check password hash
          if (!member.passwordHash) {
            console.log("❌ No password set for organization member");
            return null;
          }

          const isValid = await bcrypt.compare(
            credentials.password as string,
            member.passwordHash
          );

          if (!isValid) {
            console.log("❌ Invalid password");
            return null;
          }

          console.log("✅ Organization member authenticated successfully");

          return {
            id: member.id,
            email: member.user.email,
            organizationId: member.organizationId,
            role: member.role,
            organizationName: member.organization.name,
          };
        } catch (error) {
          console.error("❌ Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.organizationId = user.organizationId;
        token.role = user.role;
        token.organizationName = user.organizationName;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email;
        session.user.organizationId = token.organizationId as string;
        session.user.role = token.role as string;
        session.user.organizationName = token.organizationName as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// For middleware and server components
export const auth = async () => {
  const { getServerSession } = await import("next-auth/next");
  return getServerSession(authOptions);
};

export const signIn = async (provider: string, options?: any) => {
  const { signIn: nextAuthSignIn } = await import("next-auth/react");
  return nextAuthSignIn(provider, options);
};

export const signOut = async (options?: any) => {
  const { signOut: nextAuthSignOut } = await import("next-auth/react");
  return nextAuthSignOut(options);
};

export type OrganizationSession = {
  user: {
    id: string;
    email?: string | null;
    organizationId: string;
    role: string;
    organizationName?: string;
  };
};

export type OrganizationMember = OrganizationSession["user"];


