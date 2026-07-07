import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { env } from '@/config/env';
import { isValidShopDomain, verifyOAuthCallbackHmac, verifyState, exchangeCodeForToken } from '@/lib/shopify/client';

// Public route (see proxy.ts) — Shopify redirects here mid-OAuth-flow.
// Security relies entirely on the HMAC + signed `state` checks below, not on
// a session cookie, since this request originates from Shopify's servers'
// redirect instructions, not a same-origin fetch.
export async function GET(req: NextRequest) {
  const settingsUrl = (status: 'connected' | 'error') =>
    new URL(`/dashboard/settings?tab=integrations&shopify=${status}`, env.APP_URL);

  const { searchParams } = req.nextUrl;
  const shop = searchParams.get('shop');
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!shop || !isValidShopDomain(shop) || !code || !state) {
    return NextResponse.redirect(settingsUrl('error'));
  }

  if (!verifyOAuthCallbackHmac(searchParams)) {
    console.error('Shopify callback: HMAC verification failed');
    return NextResponse.redirect(settingsUrl('error'));
  }

  const businessId = verifyState(state);
  if (!businessId) {
    console.error('Shopify callback: state verification failed or expired');
    return NextResponse.redirect(settingsUrl('error'));
  }

  try {
    const { access_token, scope } = await exchangeCodeForToken(shop, code);

    await prisma.shopifyConnection.upsert({
      where: { businessId },
      create: { businessId, shopDomain: shop, accessToken: access_token, scope },
      update: { shopDomain: shop, accessToken: access_token, scope, connectedAt: new Date() },
    });

    return NextResponse.redirect(settingsUrl('connected'));
  } catch (error) {
    console.error('Shopify callback: token exchange failed', error);
    return NextResponse.redirect(settingsUrl('error'));
  }
}
