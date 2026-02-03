import { defineMiddleware } from 'astro:middleware';

const PUBLIC_PATHS = ['/', '/forgot-password', '/reset-password'];
const PUBLIC_PREFIXES = ['/m/'];
const API_URL = 'http://localhost:4000';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  const isPublic =
    PUBLIC_PATHS.includes(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));

  if (isPublic) {
    return next();
  }

  const sessionCookie = context.cookies.get('dona_session');
  if (!sessionCookie?.value) {
    return context.redirect('/');
  }

  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Cookie: `dona_session=${sessionCookie.value}` },
    });

    if (!res.ok) {
      return context.redirect('/');
    }

    const data = await res.json();
    context.locals.user = data.user;
  } catch {
    return context.redirect('/');
  }

  return next();
});
