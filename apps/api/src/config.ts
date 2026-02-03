import 'dotenv/config';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  databaseUrl: requireEnv('DATABASE_URL'),
  sessionSecret: requireEnv('SESSION_SECRET'),
  jwtSecret: requireEnv('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  sessionExpiresDays: parseInt(process.env.SESSION_EXPIRES_DAYS || '7', 10),
  isProduction: process.env.NODE_ENV === 'production',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback',
  resendApiKey: process.env.RESEND_API_KEY || '',
  appUrl: process.env.APP_URL || 'http://localhost:5174',
};
