import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import prisma from "@/lib/db/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Demo User",
      credentials: {
        userId: { label: "User ID", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.userId) {
          return null;
        }

        const userId = credentials.userId as string;
        
        const user = await prisma.user.findUnique({ where: { userId } });

        if (!user) {
          return null;
        }

        return {
          id: user.userId,
          name: user.userId,
          email: `${user.userId}@demo.healthwise`,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const userId = user.email;
        // Check if user already exists in our custom DB table
        const existingUser = await prisma.user.findUnique({ where: { userId } });
        
        if (!existingUser) {
          // Auto-provision a default profile for the Google user so the dashboard doesn't crash
          await prisma.user.create({
            data: {
              userId,
              age: 30, // Default baseline
              city: "Global",
              allergies: [],
              sleepHours: 7.5,
              dietType: "omnivorous",
              activityLevel: "moderate"
            }
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // Map Google's email to our internal userId token field immediately on login
      if (account?.provider === "google" && user?.email) {
        token.id = user.email;
      } else if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
});