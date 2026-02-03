import { FastifyInstance } from 'fastify';
import { requireAuth } from '../middleware/auth.js';
import { getRestaurantByUserId } from '../services/restaurant.js';
import { generateMenuPdf, isLatexAvailable } from '../services/pdf.js';
import {
  getMenusByRestaurantId,
  getMenuById,
  getMenuBySlug,
  createMenu,
  updateMenu,
  deleteMenu,
  createSection,
  updateSection,
  deleteSection,
  reorderSections,
  createItem,
  updateItem,
  deleteItem,
  reorderItems,
} from '../services/menu.js';

async function getRestaurantOrFail(request: any, reply: any) {
  const restaurant = await getRestaurantByUserId(request.authUser!.id);
  if (!restaurant) {
    reply.status(400).send({ ok: false, message: 'Create a restaurant first' });
    return null;
  }
  return restaurant;
}

export async function menuRoutes(fastify: FastifyInstance) {
  fastify.get('/api/menus', { preHandler: [requireAuth] }, async (request, reply) => {
    const restaurant = await getRestaurantOrFail(request, reply);
    if (!restaurant) return;
    const menus = await getMenusByRestaurantId(restaurant.id);
    return reply.send({ ok: true, menus });
  });

  fastify.get<{ Params: { id: string } }>(
    '/api/menus/:id',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const menu = await getMenuById(request.params.id);
      if (!menu) return reply.status(404).send({ ok: false, message: 'Menu not found' });
      return reply.send({ ok: true, menu });
    }
  );

  fastify.post<{ Body: { title: string; description?: string } }>(
    '/api/menus',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const restaurant = await getRestaurantOrFail(request, reply);
      if (!restaurant) return;

      const { title, description } = request.body;
      if (!title?.trim()) {
        return reply.status(400).send({ ok: false, message: 'Title is required' });
      }

      const menu = await createMenu(restaurant.id, { title: title.trim(), description });
      return reply.status(201).send({ ok: true, menu });
    }
  );

  fastify.put<{ Params: { id: string }; Body: { title?: string; description?: string; is_published?: boolean } }>(
    '/api/menus/:id',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const menu = await updateMenu(request.params.id, request.body);
      if (!menu) return reply.status(404).send({ ok: false, message: 'Menu not found' });
      return reply.send({ ok: true, menu });
    }
  );

  fastify.delete<{ Params: { id: string } }>(
    '/api/menus/:id',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const deleted = await deleteMenu(request.params.id);
      if (!deleted) return reply.status(404).send({ ok: false, message: 'Menu not found' });
      return reply.send({ ok: true });
    }
  );

  // Sections
  fastify.post<{ Params: { menuId: string }; Body: { title: string } }>(
    '/api/menus/:menuId/sections',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { title } = request.body;
      if (!title?.trim()) {
        return reply.status(400).send({ ok: false, message: 'Title is required' });
      }
      const section = await createSection(request.params.menuId, { title: title.trim() });
      return reply.status(201).send({ ok: true, section });
    }
  );

  fastify.put<{ Params: { id: string }; Body: { title: string } }>(
    '/api/sections/:id',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const section = await updateSection(request.params.id, request.body);
      if (!section) return reply.status(404).send({ ok: false, message: 'Section not found' });
      return reply.send({ ok: true, section });
    }
  );

  fastify.delete<{ Params: { id: string } }>(
    '/api/sections/:id',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const deleted = await deleteSection(request.params.id);
      if (!deleted) return reply.status(404).send({ ok: false, message: 'Section not found' });
      return reply.send({ ok: true });
    }
  );

  fastify.put<{ Params: { menuId: string }; Body: { sectionIds: string[] } }>(
    '/api/menus/:menuId/sections/reorder',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      await reorderSections(request.params.menuId, request.body.sectionIds);
      return reply.send({ ok: true });
    }
  );

  // Items
  fastify.post<{ Params: { sectionId: string }; Body: { name: string; description?: string; price?: string; tags?: string[] } }>(
    '/api/sections/:sectionId/items',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { name } = request.body;
      if (!name?.trim()) {
        return reply.status(400).send({ ok: false, message: 'Name is required' });
      }
      const item = await createItem(request.params.sectionId, { ...request.body, name: name.trim() });
      return reply.status(201).send({ ok: true, item });
    }
  );

  fastify.put<{ Params: { id: string }; Body: { name?: string; description?: string; price?: string; tags?: string[] } }>(
    '/api/items/:id',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const item = await updateItem(request.params.id, request.body);
      if (!item) return reply.status(404).send({ ok: false, message: 'Item not found' });
      return reply.send({ ok: true, item });
    }
  );

  fastify.delete<{ Params: { id: string } }>(
    '/api/items/:id',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const deleted = await deleteItem(request.params.id);
      if (!deleted) return reply.status(404).send({ ok: false, message: 'Item not found' });
      return reply.send({ ok: true });
    }
  );

  fastify.put<{ Params: { sectionId: string }; Body: { itemIds: string[] } }>(
    '/api/sections/:sectionId/items/reorder',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      await reorderItems(request.params.sectionId, request.body.itemIds);
      return reply.send({ ok: true });
    }
  );

  // PDF
  fastify.get<{ Params: { id: string } }>(
    '/api/menus/:id/pdf',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      if (!(await isLatexAvailable())) {
        return reply.status(503).send({ ok: false, message: 'PDF generation unavailable (lualatex not installed)' });
      }
      const menu = await getMenuById(request.params.id);
      if (!menu) return reply.status(404).send({ ok: false, message: 'Menu not found' });

      const pdf = await generateMenuPdf(menu);
      return reply.header('Content-Type', 'application/pdf').header('Content-Disposition', `attachment; filename="${menu.slug || 'menu'}.pdf"`).send(pdf);
    }
  );

  fastify.get<{ Params: { slug: string } }>(
    '/api/public/menus/:slug/pdf',
    async (request, reply) => {
      if (!(await isLatexAvailable())) {
        return reply.status(503).send({ ok: false, message: 'PDF generation unavailable (lualatex not installed)' });
      }
      const menu = await getMenuBySlug(request.params.slug);
      if (!menu) return reply.status(404).send({ ok: false, message: 'Menu not found' });

      const pdf = await generateMenuPdf(menu);
      return reply.header('Content-Type', 'application/pdf').header('Content-Disposition', `attachment; filename="${menu.slug || 'menu'}.pdf"`).send(pdf);
    }
  );

  // Public
  fastify.get<{ Params: { slug: string } }>(
    '/api/public/menus/:slug',
    async (request, reply) => {
      const menu = await getMenuBySlug(request.params.slug);
      if (!menu) return reply.status(404).send({ ok: false, message: 'Menu not found' });
      return reply.send({ ok: true, menu });
    }
  );
}
