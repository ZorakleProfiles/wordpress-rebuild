import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = async ({ request, redirect }, next) => {
  const url = new URL(request.url);

  // Sanity document links may point to /intent/... even when Studio is mounted at /studio.
  if (url.pathname === '/intent' || url.pathname.startsWith('/intent/')) {
    return redirect(`/studio${url.pathname}${url.search}`, 307);
  }

  return next();
};

