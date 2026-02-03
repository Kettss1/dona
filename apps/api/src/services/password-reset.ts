import { randomBytes, createHash } from 'crypto';
import { query } from '../db/client.js';
import { hashPassword } from './auth.js';

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function createResetToken(userId: string): Promise<string> {
  await query(
    'DELETE FROM password_reset_tokens WHERE user_id = $1 AND used_at IS NULL',
    [userId]
  );

  const token = randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );

  return token;
}

export async function validateResetToken(
  token: string
): Promise<{ userId: string; tokenId: string } | null> {
  const tokenHash = hashToken(token);
  const result = await query<{ id: string; user_id: string }>(
    `SELECT id, user_id FROM password_reset_tokens
     WHERE token_hash = $1 AND expires_at > now() AND used_at IS NULL`,
    [tokenHash]
  );

  const row = result.rows[0];
  if (!row) return null;
  return { userId: row.user_id, tokenId: row.id };
}

export async function markTokenUsed(tokenId: string): Promise<void> {
  await query('UPDATE password_reset_tokens SET used_at = now() WHERE id = $1', [tokenId]);
}

export async function updateUserPassword(userId: string, newPassword: string): Promise<void> {
  const hash = await hashPassword(newPassword);
  await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, userId]);
}
