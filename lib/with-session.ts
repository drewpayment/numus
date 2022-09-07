import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '../pages/api/auth/[...nextauth]';

export type Props = {
  [key: string]: any;
}

export async function withSession(ctx): Promise<{ redirect?: any, props?: Props; }> {
  const session = await unstable_getServerSession(ctx.req, ctx.res, authOptions);
  
  if (!session) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    }
  }
  
  return { props: { session } }
}