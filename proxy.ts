import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = [
  '/',
  '/access',
  '/admin/access',
  '/admin/debug-login',
  '/forgot-password',
  '/onboarding',
  '/pricing',
  '/api/auth',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/api/webhooks',
  '/forms',
  '/api/public',
  '/support',
  '/guide',
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicRoute = publicRoutes.some(route => {
    if (route === '/') return pathname === '/';
    return pathname.startsWith(route);
  });

  if (isPublicRoute) {
    return NextResponse.next();
  }

  const sessionToken =
    request.cookies.get('authjs.session-token')?.value ||
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
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
