import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcryptjs from 'bcryptjs';
import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: { // Tambahkan ini untuk TS
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials) throw new Error("No credentials provided");

        await dbConnect();
        const user = await User.findOne({ email: credentials.email }).select('+password');
        if (!user) {
          throw new Error('Invalid email or password');
        }

        const isPasswordMatch = await bcryptjs.compare(
          credentials.password,
          user.password
        );
        if (!isPasswordMatch) {
          throw new Error('Invalid email or password');
        }

        // Tipe 'User' dari next-auth.d.ts
        return { 
          id: user._id.toString(), 
          email: user.email, 
          name: user.name, 
          role: user.role 
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login', // Halaman login kustom
    error: '/login',
  }
};

export default NextAuth(authOptions);