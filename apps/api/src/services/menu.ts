import { query, getClient } from '../db/client.js';

export interface Menu {
  id: string;
  restaurant_id: string;
  title: string;
  description: string | null;
  slug: string | null;
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface MenuSection {
  id: string;
  menu_id: string;
  title: string;
  sort_order: number;
}

export interface MenuItem {
  id: string;
  section_id: string;
  name: string;
  description: string | null;
  price: string | null;
  tags: string[];
  sort_order: number;
}

export interface FullMenu extends Menu {
  sections: (MenuSection & { items: MenuItem[] })[];
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function getMenusByRestaurantId(restaurantId: string): Promise<Menu[]> {
  const result = await query<Menu>(
    'SELECT * FROM menus WHERE restaurant_id = $1 ORDER BY created_at DESC',
    [restaurantId]
  );
  return result.rows;
}

export async function getMenuById(id: string): Promise<FullMenu | null> {
  const menuResult = await query<Menu>('SELECT * FROM menus WHERE id = $1', [id]);
  const menu = menuResult.rows[0];
  if (!menu) return null;

  const sectionsResult = await query<MenuSection>(
    'SELECT * FROM menu_sections WHERE menu_id = $1 ORDER BY sort_order',
    [id]
  );

  const sections = await Promise.all(
    sectionsResult.rows.map(async (section) => {
      const itemsResult = await query<MenuItem>(
        'SELECT * FROM menu_items WHERE section_id = $1 ORDER BY sort_order',
        [section.id]
      );
      return { ...section, items: itemsResult.rows };
    })
  );

  return { ...menu, sections };
}

export async function getMenuBySlug(slug: string): Promise<FullMenu | null> {
  const menuResult = await query<Menu>(
    'SELECT * FROM menus WHERE slug = $1 AND is_published = true',
    [slug]
  );
  const menu = menuResult.rows[0];
  if (!menu) return null;

  const sectionsResult = await query<MenuSection>(
    'SELECT * FROM menu_sections WHERE menu_id = $1 ORDER BY sort_order',
    [menu.id]
  );

  const sections = await Promise.all(
    sectionsResult.rows.map(async (section) => {
      const itemsResult = await query<MenuItem>(
        'SELECT * FROM menu_items WHERE section_id = $1 ORDER BY sort_order',
        [section.id]
      );
      return { ...section, items: itemsResult.rows };
    })
  );

  return { ...menu, sections };
}

export async function createMenu(
  restaurantId: string,
  data: { title: string; description?: string }
): Promise<Menu> {
  let slug = generateSlug(data.title);
  const existing = await query('SELECT id FROM menus WHERE slug = $1', [slug]);
  if (existing.rows.length > 0) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const result = await query<Menu>(
    `INSERT INTO menus (restaurant_id, title, description, slug)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [restaurantId, data.title, data.description || null, slug]
  );
  return result.rows[0];
}

export async function updateMenu(
  id: string,
  data: { title?: string; description?: string; is_published?: boolean }
): Promise<Menu | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.title !== undefined) {
    fields.push(`title = $${idx++}`);
    values.push(data.title);
  }
  if (data.description !== undefined) {
    fields.push(`description = $${idx++}`);
    values.push(data.description);
  }
  if (data.is_published !== undefined) {
    fields.push(`is_published = $${idx++}`);
    values.push(data.is_published);
  }

  if (fields.length === 0) return getSimpleMenu(id);

  fields.push(`updated_at = now()`);
  values.push(id);

  const result = await query<Menu>(
    `UPDATE menus SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

async function getSimpleMenu(id: string): Promise<Menu | null> {
  const result = await query<Menu>('SELECT * FROM menus WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function deleteMenu(id: string): Promise<boolean> {
  const result = await query('DELETE FROM menus WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}

export async function createSection(
  menuId: string,
  data: { title: string }
): Promise<MenuSection> {
  const maxOrder = await query<{ max: number }>(
    'SELECT COALESCE(MAX(sort_order), -1) as max FROM menu_sections WHERE menu_id = $1',
    [menuId]
  );
  const sortOrder = (maxOrder.rows[0]?.max ?? -1) + 1;

  const result = await query<MenuSection>(
    `INSERT INTO menu_sections (menu_id, title, sort_order) VALUES ($1, $2, $3) RETURNING *`,
    [menuId, data.title, sortOrder]
  );
  return result.rows[0];
}

export async function updateSection(
  id: string,
  data: { title?: string }
): Promise<MenuSection | null> {
  if (!data.title) return null;
  const result = await query<MenuSection>(
    'UPDATE menu_sections SET title = $1 WHERE id = $2 RETURNING *',
    [data.title, id]
  );
  return result.rows[0] || null;
}

export async function deleteSection(id: string): Promise<boolean> {
  const result = await query('DELETE FROM menu_sections WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}

export async function reorderSections(menuId: string, sectionIds: string[]): Promise<void> {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    for (let i = 0; i < sectionIds.length; i++) {
      await client.query(
        'UPDATE menu_sections SET sort_order = $1 WHERE id = $2 AND menu_id = $3',
        [i, sectionIds[i], menuId]
      );
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function createItem(
  sectionId: string,
  data: { name: string; description?: string; price?: string; tags?: string[] }
): Promise<MenuItem> {
  const maxOrder = await query<{ max: number }>(
    'SELECT COALESCE(MAX(sort_order), -1) as max FROM menu_items WHERE section_id = $1',
    [sectionId]
  );
  const sortOrder = (maxOrder.rows[0]?.max ?? -1) + 1;

  const result = await query<MenuItem>(
    `INSERT INTO menu_items (section_id, name, description, price, tags, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      sectionId,
      data.name,
      data.description || null,
      data.price || null,
      data.tags || [],
      sortOrder,
    ]
  );
  return result.rows[0];
}

export async function updateItem(
  id: string,
  data: { name?: string; description?: string; price?: string; tags?: string[] }
): Promise<MenuItem | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.name !== undefined) {
    fields.push(`name = $${idx++}`);
    values.push(data.name);
  }
  if (data.description !== undefined) {
    fields.push(`description = $${idx++}`);
    values.push(data.description);
  }
  if (data.price !== undefined) {
    fields.push(`price = $${idx++}`);
    values.push(data.price);
  }
  if (data.tags !== undefined) {
    fields.push(`tags = $${idx++}`);
    values.push(data.tags);
  }

  if (fields.length === 0) return null;
  values.push(id);

  const result = await query<MenuItem>(
    `UPDATE menu_items SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

export async function deleteItem(id: string): Promise<boolean> {
  const result = await query('DELETE FROM menu_items WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}

export async function reorderItems(sectionId: string, itemIds: string[]): Promise<void> {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    for (let i = 0; i < itemIds.length; i++) {
      await client.query(
        'UPDATE menu_items SET sort_order = $1 WHERE id = $2 AND section_id = $3',
        [i, itemIds[i], sectionId]
      );
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
