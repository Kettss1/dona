import { FastifyRequest, FastifyReply } from 'fastify';
import { validateSession, findUserById, User } from '../services/auth.js';

const SESSION_COOKIE = 'dona_session';

declare module 'fastify' {
  interface FastifyRequest {
    authUser?: User;
  }
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const sessionId = request.cookies[SESSION_COOKIE];
  const authHeader = request.headers.authorization;

  let user: User | null = null;

  if (sessionId) {
    user = await validateSession(sessionId);
  } else if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.slice(7);
      const decoded = request.server.jwt.verify<{ userId: string }>(token);
      user = await findUserById(decoded.userId);
    } catch {
      return reply.status(401).send({
        ok: false,
        message: 'Invalid token',
      });
    }
  }

  if (!user) {
    return reply.status(401).send({
      ok: false,
      message: 'Authentication required',
    });
  }

  request.authUser = user;
}
