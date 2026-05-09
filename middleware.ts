import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware
 * 
 * Note: This is the correct Next.js convention for middleware.
 * The Turbopack warning about "proxy" is a false positive - middleware.ts
 * is the standard way to handle middleware in Next.js.
 */

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/access',
  '/onboarding',
  '/pricing',
  '/api/auth',
  '/api/webhooks',
  '/forms',
  '/api/public',
  '/support',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  const isPublicRoute = publicRoutes.some(route => {
    if (route === '/') return pathname === '/';
    return pathname.startsWith(route);
  });

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For protected routes, check for session cookie
  // NextAuth.js will handle the actual authentication in API routes
  const sessionToken = request.cookies.get('authjs.session-token')?.value || 
                       request.cookies.get('__Secure-authjs.session-token')?.value;

  if (!sessionToken) {
    const url = request.nextUrl.clone();
    url.pathname = '/access';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
