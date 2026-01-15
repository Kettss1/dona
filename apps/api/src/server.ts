import Fastify from 'fastify';
import cors from '@fastify/cors';

const fastify = Fastify({
  logger: true
});

await fastify.register(cors, {
  origin: ['http://localhost:5173', 'http://localhost:4321'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
});

interface LoginBody {
  email: string;
  password: string;
}

fastify.post<{ Body: LoginBody }>('/api/auth/login', async (request, reply) => {
  const { email, password } = request.body;

  if (!email || !password) {
    return reply.status(400).send({
      ok: false,
      message: 'Email and password are required'
    });
  }

  if (!email.includes('@')) {
    return reply.status(400).send({
      ok: false,
      message: 'Invalid email format'
    });
  }

  if (password.length < 6) {
    return reply.status(400).send({
      ok: false,
      message: 'Password must be at least 6 characters'
    });
  }

  return reply.send({
    ok: true,
    message: 'Login successful'
  });
});

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
