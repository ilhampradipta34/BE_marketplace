import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { ApiResponse, LoginData } from "@/types/api";

const apiBaseUrl =
  process.env.BACKEND_API_URL ?? "http://127.0.0.1:8000/api";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8,
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Kata sandi", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        try {
          const response = await fetch(`${apiBaseUrl}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ email, password }),
            cache: "no-store",
          });

          if (!response.ok) return null;

          const result = (await response.json()) as ApiResponse<LoginData>;
          if (!result.success || !result.data?.token) return null;

          return {
            id: String(result.data.user.id),
            name: result.data.user.name,
            email: result.data.user.email,
            apiAccessToken: result.data.token,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.apiAccessToken = user.apiAccessToken;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId ?? token.sub ?? "";
      }

      // API bearer token stays inside Auth.js's encrypted, HttpOnly session cookie.
      return session;
    },
  },
});
