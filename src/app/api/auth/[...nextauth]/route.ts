import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "student@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        let user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          // Auto-create a mock user for testing if they don't exist
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          user = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split('@')[0],
              password: hashedPassword
            }
          });
          return user;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password || '');
        
        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return user;
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        // Expose user ID in session
        (session.user as any).id = token.sub;
      }
      return session;
    }
  },
  pages: {
    // Optionally specify custom sign-in page here
    // signIn: '/login' 
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_local_dev",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
