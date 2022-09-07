import { Account, Profile, User } from 'next-auth';
import { CredentialInput } from 'next-auth/providers';
import prisma from './prisma';

const AuthService = {
  async signIn({
    user,
    account,
    profile,
    email,
    credentials,
  }: {
    user: User;
    account: Account;
    profile: Profile & Record<string, unknown>;
    email: {
      verificationRequest?: boolean;
    };
    credentials?: Record<string, CredentialInput>;
  }) {
    let dbUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: user.email,
        },
      },
    });
    
    // create a new user if one isn't found in the database.
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          name: profile.name,
          email: user.email,
          password: null,
          clients: null,
          employee: null,
          id: null,
          role: 'subscriber',
          uid: null,
          remember_token: null,
          created_at: new Date(Date.now()),
          updated_at: new Date(Date.now()),
        } as any,
      })
    }

    return dbUser != null;
  },
};

export default AuthService;
