import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import AuthService from '../../../lib/auth.lib'
import { FirestoreAdapter } from "@next-auth/firebase-adapter"
import firebase from '../../../lib/firebase'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  theme: {
    colorScheme: 'dark',
  },
  callbacks: {
    async signIn(params) {
      return await AuthService.signIn(params);
    },
  },
  
  adapter: FirestoreAdapter({
    ...firebase.config,
  }),
}

export default NextAuth(authOptions)