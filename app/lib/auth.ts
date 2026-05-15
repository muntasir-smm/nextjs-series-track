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
    };
  }

  interface User {
    role?: string;
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
          return null;
        }

        const { email, password } = validated.data;

        try {
          // Query user from Neon database including role
          const users = await sql`
            SELECT id, email, name, password, COALESCE(role, 'user') as role 
            FROM users 
            WHERE email = ${email}
            LIMIT 1
          `;

          const user = users[0];

          if (!user) {
            console.log("User not found:", email);
            return null;
          }

          // Verify password
          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) {
            console.log("Invalid password for user:", email);
            return null;
          }

          console.log("User authenticated:", email, "Role:", user.role);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role || "user",
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
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
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
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
      SELECT id, email, name, role
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
