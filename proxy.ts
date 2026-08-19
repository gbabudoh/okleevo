import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Global pivot: these modules are retired from the product (no nav entry,
// no route access) per the pivot's UK-SME-admin-bloat cleanup. Deliberately
// NOT deleted from disk or the database — existing customer data in these
// modules is completely untouched, this only blocks navigating to the page.
// Reversible: remove an id here (and re-add its nav entries) to bring a
// module back with zero data migration needed.
const retiredModulePaths = [
  '/dashboard/invoicing',
  '/dashboard/accounting',
  '/dashboard/taxation',
  '/dashboard/cashflow',
  '/dashboard/expenses',
  '/dashboard/vat-tools',
  '/dashboard/inventory',
  '/dashboard/suppliers',
  '/dashboard/micro-pages', // SME's hosted-page manager only — public /p/[slug] pages stay live
  '/dashboard/compliance',
  '/dashboard/hr-records',
  '/dashboard/ai-content', // generic marketing-copy generator — doesn't map to any of the 3 pivot pillars; AI Notes (meeting transcription/summaries) is the retained AI story
  '/dashboard/forms', // SME's form builder/manager only — public /forms/[id] submission pages for already-published forms stay live, same precedent as micro-pages above
];

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
  '/api/internal',  // Server-to-server callbacks with no user session — e.g. the malware-scan
                    // worker's result webhook. Self-gated on INTERNAL_WEBHOOK_SECRET (same
                    // pattern as /api/cron above), NOT open to browsers/users.
  '/unsubscribe',     // Campaign recipients aren't logged in; gated by unsubscribeToken
  '/api/unsubscribe',
  '/api/integrations/shopify/callback', // Shopify's redirect mid-OAuth-flow; gated by HMAC + signed state, not a session
  '/forms',
  '/booking',        // Public booking-request page (app/booking/[businessId]), no session required
  '/book',           // Layer 2 branded booking page (app/book/[businessId]/[slug]), zero-login by design
  '/room',           // Layer 2 guest video room, PIN-gated in-page (app/room/[appointmentId]), not by session
  '/helpdesk',       // Public support-ticket page (app/helpdesk/[businessId]), no session required
  '/api/public', // Includes the Layer 2 guest gateway: booking-pages, appointments/[id]/confirm,
                 // video-rooms/verify, shared-assets/[id]/view — all deliberately zero-login by
                 // design (see prisma/schema.prisma BookingPage/GuestUpload + lib/security/guest-tokens.ts).
                 // These never set a NextAuth session cookie; do not add an authenticated
                 // route under this prefix without moving it out of /api/public first.
  '/api/campaigns/track', // Open pixel + click redirect, hit by recipients' mail clients with no session
  '/p',              // Hosted micro-pages are public landing pages, no session required
  '/api/micro-pages/submit', // Public lead-capture form on hosted micro-pages, no session required
  '/api/micro-pages/track-view', // Public view-count beacon fired from hosted micro-pages, no session required
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

  if (retiredModulePaths.some(route => pathname.startsWith(route))) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'This feature is no longer available' }, { status: 410 });
    }
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
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
