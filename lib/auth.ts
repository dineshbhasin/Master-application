import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import { TOTP } from 'otplib';
import { connectDB } from './mongodb';
import User from '../models/User';

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not defined in environment variables.');
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = new MongoClient(uri).connect();
    }
    return global._mongoClientPromise;
  }
  return new MongoClient(uri).connect();
}

export const clientPromise: Promise<MongoClient> = new Promise((resolve, reject) => {
  try { resolve(getClientPromise()); } catch (e) { reject(e); }
});

export const authOptions: AuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        token: { label: '2FA Token', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required.');
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email.toLowerCase() }).select(
          '+password +twoFactorSecret'
        );

        if (!user) {
          throw new Error('Invalid email or password.');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          throw new Error('Invalid email or password.');
        }

        if (user.twoFactorEnabled) {
          if (!credentials.token) {
            throw new Error('2FA_REQUIRED');
          }
          const totp = new TOTP();
          const isTokenValid = await totp.verify(credentials.token, {
            secret: user.twoFactorSecret as string,
          });
          if (!isTokenValid) {
            throw new Error('Invalid 2FA token.');
          }
        }

        await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          twoFactorEnabled: user.twoFactorEnabled,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.twoFactorEnabled = (user as { twoFactorEnabled?: boolean }).twoFactorEnabled;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { twoFactorEnabled?: boolean }).twoFactorEnabled =
          token.twoFactorEnabled as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
