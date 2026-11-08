import { NextAuthOptions } from "next-auth";
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
        action: { label: "Action", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Please enter your email and password.");
          }

          const email = credentials.email.toLowerCase();

          let user = await prisma.user.findUnique({
            where: { email },
          });

          // Registration Flow
          if (credentials.action === "signup") {
            if (user) {
              throw new Error("An account with this email address already exists.");
            }
            const hashedPassword = await bcrypt.hash(credentials.password, 10);
            const signupName =
              credentials.name && credentials.name !== "undefined" && credentials.name.trim() !== ""
                ? credentials.name
                : email.split("@")[0];

            user = await prisma.user.create({
              data: {
                email,
                name: signupName,
                password: hashedPassword,
              },
            });

            return {
              id: user.id,
              email: user.email,
              name: user.name,
            };
          }

          // Login Flow
          if (!user || !user.password) {
            throw new Error("No account found with this email. Please sign up first.");
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) {
            throw new Error("Incorrect password. Please try again.");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error: unknown) {
          const rawMessage = error instanceof Error ? error.message : String(error);

          if (expectedAuthErrors.has(rawMessage)) {
            throw error;
          }

          if (isDatabaseAvailabilityError(error)) {
            console.error("Database unavailable during auth:", error);
            throw new Error("Database service is temporarily unavailable. Please try again in a few moments.");
          }

          console.error("Unexpected error in NextAuth authorize:", error);
          throw new Error("Unable to complete authentication. Please try again.");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as { id?: string }).id = token.id as string;
        const nameVal = token.name as string;
        session.user.name =
          !nameVal || nameVal === "undefined"
            ? session.user.email
              ? session.user.email.split("@")[0]
              : "User"
            : nameVal;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "careerengine_super_secret_key_2026",
};

