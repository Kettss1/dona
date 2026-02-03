import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  createUser,
  findUserByEmail,
  verifyPassword,
  createSession,
  destroySession,
  validateSession,
  findUserById,
  User,
} from '../services/auth.js';
import { config } from '../config.js';
import { sendPasswordResetEmail } from '../services/email.js';
import {
  createResetToken,
  validateResetToken,
  markTokenUsed,
  updateUserPassword,
} from '../services/password-reset.js';

interface RegisterBody {
  email: string;
  password: string;
  name?: string;
}

interface LoginBody {
  email: string;
  password: string;
  includeToken?: boolean;
}

const SESSION_COOKIE = 'dona_session';

function setSessionCookie(reply: FastifyReply, sessionId: string) {
  reply.setCookie(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: config.sessionExpiresDays * 24 * 60 * 60,
  });
}

function clearSessionCookie(reply: FastifyReply) {
  reply.clearCookie(SESSION_COOKIE, {
    path: '/',
  });
}

function formatUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

const rateLimitMap = new Map<string, number>();

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: RegisterBody }>('/api/auth/register', async (request, reply) => {
    const { email, password, name } = request.body;

    if (!email || !password) {
      return reply.status(400).send({
        ok: false,
        message: 'Email and password are required',
      });
    }

    if (!email.includes('@')) {
      return reply.status(400).send({
        ok: false,
        message: 'Invalid email format',
      });
    }

    if (password.length < 6) {
      return reply.status(400).send({
        ok: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return reply.status(409).send({
        ok: false,
        message: 'Email already registered',
      });
    }

    const user = await createUser(email, password, name);
    const sessionId = await createSession(user.id);
    setSessionCookie(reply, sessionId);

    const response: { ok: boolean; user: ReturnType<typeof formatUser>; token?: string } = {
      ok: true,
      user: formatUser(user),
    };

    if (request.body.name === undefined) {
      const token = fastify.jwt.sign({ userId: user.id });
      response.token = token;
    }

    return reply.status(201).send(response);
  });

  fastify.post<{ Body: LoginBody }>('/api/auth/login', async (request, reply) => {
    const { email, password, includeToken } = request.body;

    if (!email || !password) {
      return reply.status(400).send({
        ok: false,
        message: 'Email and password are required',
      });
    }

    const user = await findUserByEmail(email);
    if (!user || !user.password_hash) {
      return reply.status(401).send({
        ok: false,
        message: 'Invalid email or password',
      });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return reply.status(401).send({
        ok: false,
        message: 'Invalid email or password',
      });
    }

    const sessionId = await createSession(user.id);
    setSessionCookie(reply, sessionId);

    const response: { ok: boolean; user: ReturnType<typeof formatUser>; token?: string } = {
      ok: true,
      user: formatUser(user),
    };

    if (includeToken) {
      const token = fastify.jwt.sign({ userId: user.id });
      response.token = token;
    }

    return reply.send(response);
  });

  fastify.post('/api/auth/logout', async (request, reply) => {
    const sessionId = request.cookies[SESSION_COOKIE];
    if (sessionId) {
      await destroySession(sessionId);
      clearSessionCookie(reply);
    }
    return reply.send({ ok: true });
  });

  fastify.get('/api/auth/me', async (request, reply) => {
    const sessionId = request.cookies[SESSION_COOKIE];
    const authHeader = request.headers.authorization;

    let user: User | null = null;

    if (sessionId) {
      user = await validateSession(sessionId);
    } else if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.slice(7);
        const decoded = fastify.jwt.verify<{ userId: string }>(token);
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
        message: 'Not authenticated',
      });
    }

    return reply.send({
      ok: true,
      user: formatUser(user),
    });
  });

  fastify.post('/api/auth/refresh', async (request, reply) => {
    const sessionId = request.cookies[SESSION_COOKIE];
    if (!sessionId) {
      return reply.status(401).send({
        ok: false,
        message: 'No session found',
      });
    }

    const user = await validateSession(sessionId);
    if (!user) {
      clearSessionCookie(reply);
      return reply.status(401).send({
        ok: false,
        message: 'Session expired',
      });
    }

    const token = fastify.jwt.sign({ userId: user.id });
    return reply.send({
      ok: true,
      token,
    });
  });

  fastify.post<{ Body: { email: string } }>('/api/auth/forgot-password', async (request, reply) => {
    const { email } = request.body;
    if (!email) {
      return reply.status(400).send({ ok: false, message: 'Email is required' });
    }

    const now = Date.now();
    const lastRequest = rateLimitMap.get(email.toLowerCase());
    if (lastRequest && now - lastRequest < 60000) {
      return reply.status(429).send({ ok: false, message: 'Please wait before requesting again' });
    }
    rateLimitMap.set(email.toLowerCase(), now);

    const user = await findUserByEmail(email);
    if (user) {
      const token = await createResetToken(user.id);
      const resetUrl = `${config.appUrl}/reset-password?token=${token}`;
      await sendPasswordResetEmail(user.email, resetUrl);
    }

    return reply.send({ ok: true, message: 'If the email exists, a reset link has been sent' });
  });

  fastify.post<{ Body: { token: string; password: string } }>('/api/auth/reset-password', async (request, reply) => {
    const { token, password } = request.body;

    if (!token || !password) {
      return reply.status(400).send({ ok: false, message: 'Token and password are required' });
    }

    if (password.length < 6) {
      return reply.status(400).send({ ok: false, message: 'Password must be at least 6 characters' });
    }

    const result = await validateResetToken(token);
    if (!result) {
      return reply.status(400).send({ ok: false, message: 'Invalid or expired reset link' });
    }

    await updateUserPassword(result.userId, password);
    await markTokenUsed(result.tokenId);

    return reply.send({ ok: true, message: 'Password has been reset' });
  });
}
