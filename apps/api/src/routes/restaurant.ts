import { FastifyInstance } from 'fastify';
import { requireAuth } from '../middleware/auth.js';
import {
  getRestaurantByUserId,
  createRestaurant,
  updateRestaurant,
} from '../services/restaurant.js';

interface RestaurantBody {
  name: string;
  address?: string;
  phone?: string;
  logo_url?: string;
}

export async function restaurantRoutes(fastify: FastifyInstance) {
  fastify.get('/api/restaurants', { preHandler: [requireAuth] }, async (request, reply) => {
    const restaurant = await getRestaurantByUserId(request.authUser!.id);
    return reply.send({ ok: true, restaurant });
  });

  fastify.post<{ Body: RestaurantBody }>(
    '/api/restaurants',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { name, address, phone, logo_url } = request.body;

      if (!name || !name.trim()) {
        return reply.status(400).send({ ok: false, message: 'Restaurant name is required' });
      }

      const existing = await getRestaurantByUserId(request.authUser!.id);
      if (existing) {
        return reply.status(409).send({ ok: false, message: 'Restaurant already exists' });
      }

      const restaurant = await createRestaurant(request.authUser!.id, {
        name: name.trim(),
        address,
        phone,
        logo_url,
      });
      return reply.status(201).send({ ok: true, restaurant });
    }
  );

  fastify.put<{ Body: RestaurantBody }>(
    '/api/restaurants',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const existing = await getRestaurantByUserId(request.authUser!.id);
      if (!existing) {
        return reply.status(404).send({ ok: false, message: 'No restaurant found' });
      }

      const restaurant = await updateRestaurant(existing.id, request.authUser!.id, request.body);
      return reply.send({ ok: true, restaurant });
    }
  );
}
