import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { env } from '@/config/env';
import { isConfigured, isValidShopDomain, signState, buildAuthorizeUrl } from '@/lib/shopify/client';

export const GET = withMultiTenancy(async (req, { user }) => {
  if (!isConfigured()) {
    return NextResponse.json({ error: 'Shopify integration is not configured on this server' }, { status: 503 });
  }

  const shop = req.nextUrl.searchParams.get('shop');
  if (!shop || !isValidShopDomain(shop)) {
    return NextResponse.json({ error: 'shop must be a valid *.myshopify.com domain' }, { status: 400 });
  }

  const state = signState(user.businessId);
  const redirectUri = `${env.APP_URL}/api/integrations/shopify/callback`;
  const authorizeUrl = buildAuthorizeUrl(shop, redirectUri, state);

  return NextResponse.redirect(authorizeUrl);
});
