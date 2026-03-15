import type { NextAuthConfig } from "next-auth";

// Auth config without Prisma adapter — safe for Edge Runtime (middleware).
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [], // populated in auth.ts
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const protectedPaths = ["/dashboard", "/profile", "/apply"];
      const isProtected = protectedPaths.some((p) =>
        nextUrl.pathname.startsWith(p),
      );

      if (isProtected && !isLoggedIn) {
        return false; // redirects to signIn page
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
