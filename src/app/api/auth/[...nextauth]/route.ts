import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

const expectedAuthErrors = new Set([
  "Please enter your email and password.",
  "An account with this email address already exists.",
  "No account found with this email. Please sign up first.",
  "Incorrect password. Please try again.",
]);

function isDatabaseAvailabilityError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("Unable to open the database file") ||
    message.includes("Error querying the database") ||
    message.includes("Can't reach database server") ||
    message.includes("Timed out fetching a new connection") ||
    message.includes("PrismaClientInitializationError") ||
    message.includes("PrismaClientKnownRequestError")
  );
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        action: { label: "Action", type: "text" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Please enter your email and password.");
          }

          const email = credentials.email.toLowerCase();

          let user = await prisma.user.findUnique({
            where: { email }
          });

          // Registration Flow
          if (credentials.action === "signup") {
            if (user) {
              throw new Error("An account with this email address already exists.");
            }
            const hashedPassword = await bcrypt.hash(credentials.password, 10);
            const signupName = (credentials.name && credentials.name !== "undefined" && credentials.name.trim() !== "") 
              ? credentials.name 
              : email.split('@')[0];

            user = await prisma.user.create({
              data: {
                email,
                name: signupName,
                password: hashedPassword
              }
            });
            return user;
          }

          // Login Flow
          if (!user) {
            throw new Error("No account found with this email. Please sign up first.");
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password || '');
        
          if (!isPasswordValid) {
            throw new Error("Incorrect password. Please try again.");
          }

          // Auto-correct corrupted "undefined" or null name in database
          if (!user.name || user.name === "undefined" || user.name.trim() === "") {
            const fallbackName = email.split('@')[0];
            user = await prisma.user.update({
              where: { id: user.id },
              data: { name: fallbackName }
            });
          }

          return user;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          if (expectedAuthErrors.has(message)) {
            throw error;
          }

          console.error("Credentials auth failed:", error);

          if (isDatabaseAvailabilityError(error)) {
            throw new Error("Account service is temporarily unavailable. Please check the production database configuration.");
          }

          throw new Error("Unable to complete authentication right now. Please try again.");
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days session persistence
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name && user.name !== "undefined" ? user.name : null;
      }
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as any).id = token.id;
        const nameVal = token.name as string;
        session.user.name = (!nameVal || nameVal === "undefined") 
          ? (session.user.email ? session.user.email.split('@')[0] : "User")
          : nameVal;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || "careerengine_super_secret_key_2026",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
