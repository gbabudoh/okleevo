import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const config = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('[AUTH] ❌ Missing email or password');
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;
        
        console.log('[AUTH] ========================================');
        console.log('[AUTH] 🔐 Starting authentication for:', email);
        console.log('[AUTH] ========================================');

        try {
          const user = await prisma.user.findUnique({
            where: { email },
            include: { business: true },
          });

          if (!user) {
            console.log('[AUTH] ❌ User not found:', email);
            console.log('[AUTH] 💡 Run POST /api/admin/fix-login to create the user');
            return null;
          }

          console.log('[AUTH] ✅ User found!');
          console.log('[AUTH]    ID:', user.id);
          console.log('[AUTH]    Role:', user.role);
          console.log('[AUTH]    Status:', user.status);
          console.log('[AUTH]    Has Password:', !!user.password);

          if (!user.password) {
            console.log('[AUTH] ❌ User has no password set');
            console.log('[AUTH] 💡 Run POST /api/admin/fix-login to set the password');
            return null;
          }

          console.log('[AUTH] 🔑 Comparing password...');
          const isPasswordValid = await bcrypt.compare(password, user.password);

          if (!isPasswordValid) {
            console.log('[AUTH] ❌ Password does NOT match');
            console.log('[AUTH] 💡 Run POST /api/admin/fix-login to reset the password');
            return null;
          }

          console.log('[AUTH] ✅ Password is VALID!');

          // Update last login
          try {
            await prisma.user.update({
              where: { id: user.id },
              data: { lastLoginAt: new Date() },
            });
            console.log('[AUTH] ✅ Last login updated');
          } catch (updateError) {
            console.warn('[AUTH] ⚠️ Could not update lastLoginAt:', updateError);
            // Don't fail login if this fails
          }

          const userObject = {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            image: (user as any).image || (user as any).avatar || null,
            role: user.role,
          };

          console.log('[AUTH] ✅✅✅ LOGIN SUCCESSFUL! ✅✅✅');
          console.log('[AUTH] Returning user object:', { ...userObject, password: '[HIDDEN]' });
          console.log('[AUTH] ========================================');

          return userObject;
        } catch (error: any) {
          console.error('[AUTH] ❌❌❌ ERROR DURING AUTHORIZATION ❌❌❌');
          console.error('[AUTH] Error type:', error?.constructor?.name);
          console.error('[AUTH] Error message:', error?.message);
          console.error('[AUTH] Error stack:', error?.stack);
          console.error('[AUTH] ========================================');
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/access",
    error: "/access",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days - session persists for 30 days
    updateAge: 24 * 60 * 60, // 24 hours - update session every 24 hours
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = (user as any).role; // Store role in token
        // Get businessId from user - fetch from database
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { businessId: true, role: true },
          });
          if (dbUser) {
            token.businessId = dbUser.businessId;
            token.role = dbUser.role; // Ensure role is set from database
          }
        } catch (error) {
          console.error('Error fetching user businessId:', error);
        }
      }
      
      // Update token on session update
      if (trigger === "update") {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { businessId: true, role: true },
          });
          if (dbUser) {
            token.businessId = dbUser.businessId;
            token.role = dbUser.role; // Update role from database
          }
        } catch (error) {
          console.error('Error updating token:', error);
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).businessId = token.businessId as string;
        (session.user as any).role = token.role as string; // Include role in session
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: `authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
