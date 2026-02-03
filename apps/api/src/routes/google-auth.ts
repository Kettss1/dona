import { FastifyInstance } from 'fastify';
import { config } from '../config.js';
import { findOrCreateGoogleUser, createSession } from '../services/auth.js';

export async function googleAuthRoutes(fastify: FastifyInstance) {
  fastify.get('/api/auth/google', async (_request, reply) => {
    const params = new URLSearchParams({
      client_id: config.googleClientId,
      redirect_uri: config.googleCallbackUrl,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    });

    return reply.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  });

  fastify.get('/api/auth/google/callback', async (request, reply) => {
    const { code } = request.query as { code?: string };

    if (!code) {
      return reply.redirect('http://localhost:5174/?auth=error');
    }

    try {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: config.googleClientId,
          client_secret: config.googleClientSecret,
          redirect_uri: config.googleCallbackUrl,
          grant_type: 'authorization_code',
        }),
      });

      const tokens = await tokenResponse.json() as { access_token?: string };
      if (!tokens.access_token) {
        return reply.redirect('http://localhost:5174/?auth=error');
      }

      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      const userInfo = await userInfoResponse.json() as { id: string; email: string; name?: string };

      const user = await findOrCreateGoogleUser(userInfo.id, userInfo.email, userInfo.name || null);
      const sessionId = await createSession(user.id);

      reply.setCookie('dona_session', sessionId, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: config.isProduction,
        maxAge: config.sessionExpiresDays * 24 * 60 * 60,
      });

      return reply.redirect('http://localhost:5174/?auth=success');
    } catch {
      return reply.redirect('http://localhost:5174/?auth=error');
    }
  });
}
