import fastify from 'fastify';
import { createYoga, createSchema } from 'graphql-yoga';
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

import { productsResolvers } from './products/products.resolvers.ts';
import { ordersResolvers } from './orders/orders.resolvers.ts';
import { FastifyContext } from './types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productsSchema = readFileSync(
  path.join(__dirname, './products/products.graphql'),
  'utf8'
);
const ordersSchema = readFileSync(
  path.join(__dirname, './orders/orders.graphql'),
  'utf8'
);

const typeDefs = mergeTypeDefs([productsSchema, ordersSchema]);
const resolvers = mergeResolvers([
  productsResolvers,
  ordersResolvers,
]) as FastifyContext;

function buildApp(logging = true) {
  const app = fastify({
    logger: logging,
  });

  const yoga = createYoga<FastifyContext>({
    schema: createSchema({
      typeDefs,
      resolvers,
    }),
    logging: {
      debug: (...args) => {
        for (const arg of args) app.log.debug(arg);
      },
      info: (...args) => {
        for (const arg of args) app.log.info(arg);
      },
      warn: (...args) => {
        for (const arg of args) app.log.warn(arg);
      },
      error: (...args) => {
        for (const arg of args) app.log.error(arg);
      },
    },
  });

  app.route({
    url: yoga.graphqlEndpoint,
    method: ['GET', 'POST', 'OPTIONS'],
    handler: async (req, reply) => {
      const response = await yoga.handleNodeRequestAndResponse(req, reply, {
        req,
        reply,
      });

      response.headers.forEach((value, key) => {
        reply.header(key, value);
      });

      reply.status(response.status);
      reply.send(response.body);

      return reply;
    },
  });

  return [app, yoga.graphqlEndpoint] as const;
}

export default buildApp;
