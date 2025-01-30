import fastify, { FastifyReply, FastifyRequest } from 'fastify';
import {
  createYoga,
  createSchema,
  useExecutionCancellation,
} from 'graphql-yoga';

function buildApp(logging = true) {
  const app = fastify({
    logger: logging,
  });

  const yoga = createYoga<{
    req: FastifyRequest;
    reply: FastifyReply;
  }>({
    plugins: [useExecutionCancellation()],
    schema: createSchema({
      typeDefs: /* GraphQL */ `
        scalar File

        type Query {
          hello: String
          isFastify: Boolean
          slow: Nested
        }
        type Nested {
          field: String
        }
      `,
      resolvers: {
        Query: {
          hello: () => 'world',
          isFastify: (_, __, context) => !!context.req && !!context.reply,
          async slow(_, __, context) {
            await new Promise<void>((res, rej) => {
              context.req.log.info('Slow resolver invoked');

              const timeout = setTimeout(() => {
                context.req.log.info('Slow field resolved');
                res();
              }, 1000);

              context.request.signal.addEventListener('abort', () => {
                context.req.log.info('Slow field got cancelled');
                clearTimeout(timeout);
                rej(context.request.signal.reason);
              });
            });

            return {};
          },
        },
        Nested: {
          field(_, __, context) {
            context.req.log.info('Nested resolver called');
          },
        },
      },
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
