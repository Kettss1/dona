import { query } from '../db/client.js';

export interface Restaurant {
  id: string;
  user_id: string;
  name: string;
  address: string | null;
  phone: string | null;
  logo_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export async function getRestaurantByUserId(userId: string): Promise<Restaurant | null> {
  const result = await query<Restaurant>(
    'SELECT * FROM restaurants WHERE user_id = $1',
    [userId]
  );
  return result.rows[0] || null;
}

export async function createRestaurant(
  userId: string,
  data: { name: string; address?: string; phone?: string; logo_url?: string }
): Promise<Restaurant> {
  const result = await query<Restaurant>(
    `INSERT INTO restaurants (user_id, name, address, phone, logo_url)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, data.name, data.address || null, data.phone || null, data.logo_url || null]
  );
  return result.rows[0];
}

export async function updateRestaurant(
  id: string,
  userId: string,
  data: { name?: string; address?: string; phone?: string; logo_url?: string }
): Promise<Restaurant | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.name !== undefined) {
    fields.push(`name = $${idx++}`);
    values.push(data.name);
  }
  if (data.address !== undefined) {
    fields.push(`address = $${idx++}`);
    values.push(data.address);
  }
  if (data.phone !== undefined) {
    fields.push(`phone = $${idx++}`);
    values.push(data.phone);
  }
  if (data.logo_url !== undefined) {
    fields.push(`logo_url = $${idx++}`);
    values.push(data.logo_url);
  }

  if (fields.length === 0) return getRestaurantByUserId(userId);

  fields.push(`updated_at = now()`);
  values.push(id, userId);

  const result = await query<Restaurant>(
    `UPDATE restaurants SET ${fields.join(', ')} WHERE id = $${idx++} AND user_id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0] || null;
}
