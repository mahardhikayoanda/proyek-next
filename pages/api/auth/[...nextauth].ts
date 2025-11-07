import NextAuth, { NextAuthOptions } from 'next-auth';
// ... (import lainnya tetap sama) ...
import CredentialsProvider from 'next-auth/providers/credentials';
import bcryptjs from 'bcryptjs';
import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';

export const authOptions: NextAuthOptions = {
  session: {
// ... (session config tetap sama) ...
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
// ... (credentials config tetap sama) ...
      name: 'Credentials',
      credentials: { 
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials) throw new Error("No credentials provided");

        await dbConnect();
        const user = await User.findOne({ email: credentials.email }).select('+password');
        
        // Guard 1: Cek jika user tidak ditemukan
        if (!user) {
          throw new Error('Invalid email or password');
        }

        // --- PERBAIKAN DI SINI ---
        // Guard 2: Cek jika password (yang kita select) ada
        // Ini akan meyakinkan TypeScript bahwa user.password adalah 'string'
        if (!user.password) {
          throw new Error('User data is corrupted. Password missing.');
        }
        // -------------------------

        const isPasswordMatch = await bcryptjs.compare(
          credentials.password,
          user.password // <-- Sekarang ini aman (string)
        );
        if (!isPasswordMatch) {
          throw new Error('Invalid email or password');
        }

        // Tipe 'User' dari next-auth.d.ts
// ... (return user tetap sama) ...
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
// ... (callbacks jwt dan session tetap sama) ...
    jwt: async ({ token, user }) => {
// ... (existing code) ...
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session: async ({ session, token }) => {
// ... (existing code) ...
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
// ... (pages config tetap sama) ...
  pages: {
    signIn: '/login', // Halaman login kustom
    error: '/login',
  }
};

export default NextAuth(authOptions);