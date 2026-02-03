import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import { config } from './config.js';
import { authRoutes } from './routes/auth.js';
import { googleAuthRoutes } from './routes/google-auth.js';
import { restaurantRoutes } from './routes/restaurant.js';
import { menuRoutes } from './routes/menu.js';

const fastify = Fastify({
  logger: true
});

await fastify.register(cors, {
  origin: ['http://localhost:5174', 'http://localhost:4321'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
});

await fastify.register(cookie);

await fastify.register(jwt, {
  secret: config.jwtSecret,
  sign: {
    expiresIn: config.jwtExpiresIn
  }
});

await fastify.register(authRoutes);
await fastify.register(googleAuthRoutes);
await fastify.register(restaurantRoutes);
await fastify.register(menuRoutes);

fastify.get('/api/health', async () => {
  return { status: 'ok' };
});

try {
  await fastify.listen({ port: 4000, host: '0.0.0.0' });
  console.log('Server running on http://localhost:4000');
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
