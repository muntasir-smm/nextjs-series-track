// app/lib/auth.ts

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sql } from "./db";

// Extend the session type
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      is_banned: boolean;
      is_active: boolean;
    };
  }

  interface User {
    role?: string;
    is_banned?: boolean;
    is_active?: boolean;
  }
}

// Validation schema for login credentials
const credentialsSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// NextAuth configuration
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "user@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validated = credentialsSchema.safeParse(credentials);
        if (!validated.success) {
          console.error("Validation error:", validated.error);
          throw new Error("Invalid credentials");
        }

        const { email, password } = validated.data;

        try {
          // Query user from Neon database including role, is_banned, is_active
          const users = await sql`
            SELECT id, email, name, password, COALESCE(role, 'user') as role, 
                   COALESCE(is_banned, false) as is_banned, 
                   COALESCE(is_active, true) as is_active
            FROM users 
            WHERE email = ${email}
            LIMIT 1
          `;

          const user = users[0];

          if (!user) {
            throw new Error("Invalid email or password");
          }

          // Check if user is banned
          if (user.is_banned) {
            throw new Error("banned");
          }

          // Check if user is active
          if (!user.is_active) {
            throw new Error("inactive");
          }

          // Verify password
          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) {
            throw new Error("Invalid email or password");
          }

          // Update last login timestamp
          await sql`
            UPDATE users 
            SET last_login = NOW() 
            WHERE email = ${email}
          `;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role || "user",
            is_banned: user.is_banned || false,
            is_active: user.is_active || true,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          throw error;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 1 * 24 * 60 * 60, // 1 day
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.is_banned = user.is_banned;
        token.is_active = user.is_active;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
        session.user.is_banned = token.is_banned as boolean;
        session.user.is_active = token.is_active as boolean;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
});

// Helper functions
export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.email) return null;

  try {
    const users = await sql`
      SELECT id, email, name, role, is_banned, is_active
      FROM users 
      WHERE email = ${session.user.email}
      LIMIT 1
    `;
    return users[0] || null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function isAuthenticated() {
  const session = await auth();
  return !!session;
}

export async function isAdmin() {
  const session = await auth();
  return session?.user?.role === "admin";
}
