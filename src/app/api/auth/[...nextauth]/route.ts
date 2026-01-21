// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import clientPromise from "@/lib/database/mongodb";

export const authOptions = {
  // Direct Link Strategy: Bypasses the failing adapter package
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      const client = await clientPromise;
      const db = client.db("lernitt-v2");
      
      // Manually link user to MongoDB
      const existingUser = await db.collection("users").findOne({ email: user.email });
      if (!existingUser) {
        await db.collection("users").insertOne({
          name: user.name,
          email: user.email,
          image: user.image,
          role: 'user', // Default role
          createdAt: new Date()
        });
      }
      return true;
    },
    async session({ session, token }: any) {
      if (session?.user) {
        const client = await clientPromise;
        const db = client.db("lernitt-v2");
        const dbUser = await db.collection("users").findOne({ email: session.user.email });
        if (dbUser) {
          session.user.id = dbUser._id.toString();
          session.user.role = dbUser.role || 'user';
        }
      }
      return session;
    },
  },
  pages: { signIn: '/login' }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
