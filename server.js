import fastify, { FastifyReply, FastifyRequest } from 'fastify';
import { createYoga } from 'graphql-yoga';

const app = fastify({
  logger: {
    transport: {
      target: '@fastify/one-line-logger',
    },
  },
});

const yoga =
  createYoga <
  {
    req: FastifyRequest,
    reply: FastifyReply,
  } >
  {
    logging: {
      debug: (...args) => args.forEach((arg) => app.log.debug(arg)),
      info: (...args) => args.forEach((arg) => app.log.info(arg)),
      warn: (...args) => args.forEach((arg) => app.log.warn(arg)),
      error: (...args) => args.forEach((arg) => app.log.error(arg)),
    },
  };

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

app.listen(4000);
