import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-micro';
import { ApolloServerPluginLandingPageDisabled, ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { buildSchema } from 'type-graphql';
import { resolvers } from '@generated/type-graphql';

import { NextApiRequest, NextApiResponse } from 'next';
import { createContext } from '../../../graphql/context';

let apolloServerHandler: (req: any, res: any) => Promise<void>;

const getApolloServerHandler = async () => {
  if (!apolloServerHandler) {
    const schema = await buildSchema({
      resolvers,
      validate: false,
    });
    
    const server = new ApolloServer({
      context: createContext,
      schema,
      plugins: [
        process.env.NODE_ENV === 'production'
          ? ApolloServerPluginLandingPageDisabled()
          : ApolloServerPluginLandingPageGraphQLPlayground(),
      ],
      introspection: true,
    })
    
    await server.start()
    
    apolloServerHandler = server.createHandler({
      path: '/api/graphql',
    });
  }
  
  return apolloServerHandler;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const apolloServerHandler = await getApolloServerHandler();
  return apolloServerHandler(req, res);
};

export const config = { api: { bodyParser: false } };

export default handler;