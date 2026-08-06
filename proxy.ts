import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = [
  '/',
  '/access',
  '/admin/access',
  '/admin/debug-login',
  '/forgot-password',
  '/onboarding',
  '/api/onboarding',
  '/pricing',
  '/terms',
  '/privacy',
  '/api/auth',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/api/webhooks',  // Stripe webhook must be public (no session)
  '/api/cron',      // Vercel Cron has no session; routes self-gate on CRON_SECRET
  '/unsubscribe',     // Campaign recipients aren't logged in; gated by unsubscribeToken
  '/api/unsubscribe',
  '/api/integrations/shopify/callback', // Shopify's redirect mid-OAuth-flow; gated by HMAC + signed state, not a session
  '/forms',
  '/api/public',
  '/p',              // Hosted micro-pages are public landing pages, no session required
  '/support',
  '/guide',
  '/sitemap.xml',
  '/robots.txt',
  '/llms.txt',
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
    request.cookies.get('__Secure-authjs.session-token')?.value ||
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value;

  if (!sessionToken) {
    // Return 401 JSON for API requests instead of redirecting to HTML access page
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const callbackUrl = pathname + (request.nextUrl.search || '');
    const url = request.nextUrl.clone();
    url.pathname = '/access';
    url.search = `?callbackUrl=${encodeURIComponent(callbackUrl)}`;
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
