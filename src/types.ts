import { FastifyReply, FastifyRequest } from 'fastify';

export type FastifyContext = {
  req: FastifyRequest;
  reply: FastifyReply;
};
