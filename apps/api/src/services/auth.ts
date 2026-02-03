import bcrypt from 'bcryptjs';
import { query } from '../db/client.js';
import { config } from '../config.js';

const SALT_ROUNDS = 12;

export interface User {
  id: string;
  email: string;
  name: string | null;
  created_at: Date;
  updated_at: Date;
}

interface UserRow extends User {
  password_hash: string | null;
  google_id: string | null;
}

interface SessionRow {
  id: string;
  user_id: string;
  expires_at: Date;
  created_at: Date;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createUser(email: string, password: string | null, name?: string): Promise<User> {
  const passwordHash = password ? await hashPassword(password) : null;
  const result = await query<User>(
    `INSERT INTO users (email, password_hash, name)
     VALUES ($1, $2, $3)
     RETURNING id, email, name, created_at, updated_at`,
    [email.toLowerCase(), passwordHash, name || null]
  );
  return result.rows[0];
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const result = await query<UserRow>(
    'SELECT id, email, password_hash, name, created_at, updated_at FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  return result.rows[0] || null;
}

export async function findUserById(id: string): Promise<User | null> {
  const result = await query<User>(
    'SELECT id, email, name, created_at, updated_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

export async function createSession(userId: string): Promise<string> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + config.sessionExpiresDays);

  const result = await query<SessionRow>(
    `INSERT INTO sessions (user_id, expires_at)
     VALUES ($1, $2)
     RETURNING id`,
    [userId, expiresAt]
  );
  return result.rows[0].id;
}

export async function validateSession(sessionId: string): Promise<User | null> {
  const result = await query<User & { session_id: string }>(
    `SELECT u.id, u.email, u.name, u.created_at, u.updated_at, s.id as session_id
     FROM sessions s
     JOIN users u ON s.user_id = u.id
     WHERE s.id = $1 AND s.expires_at > NOW()`,
    [sessionId]
  );
  return result.rows[0] || null;
}

export async function destroySession(sessionId: string): Promise<void> {
  await query('DELETE FROM sessions WHERE id = $1', [sessionId]);
}

export async function cleanExpiredSessions(): Promise<number> {
  const result = await query('DELETE FROM sessions WHERE expires_at < NOW()');
  return result.rowCount || 0;
}

export async function findOrCreateGoogleUser(googleId: string, email: string, name: string | null): Promise<User> {
  const byGoogle = await query<User>(
    'SELECT id, email, name, created_at, updated_at FROM users WHERE google_id = $1',
    [googleId]
  );
  if (byGoogle.rows[0]) return byGoogle.rows[0];

  const byEmail = await query<UserRow>(
    'SELECT id, email, password_hash, google_id, name, created_at, updated_at FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  if (byEmail.rows[0]) {
    await query('UPDATE users SET google_id = $1, updated_at = NOW() WHERE id = $2', [googleId, byEmail.rows[0].id]);
    return { id: byEmail.rows[0].id, email: byEmail.rows[0].email, name: byEmail.rows[0].name, created_at: byEmail.rows[0].created_at, updated_at: new Date() };
  }

  const result = await query<User>(
    `INSERT INTO users (email, password_hash, name, google_id)
     VALUES ($1, NULL, $2, $3)
     RETURNING id, email, name, created_at, updated_at`,
    [email.toLowerCase(), name, googleId]
  );
  return result.rows[0];
}
