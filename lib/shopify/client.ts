import crypto from 'crypto';

const SHOPIFY_API_VERSION = '2024-01';

const getStateSecret = () => process.env.SHOPIFY_STATE_SECRET;
const getApiKey = () => process.env.SHOPIFY_API_KEY;
const getApiSecret = () => process.env.SHOPIFY_API_SECRET;

export function isConfigured(): boolean {
  return !!(getApiKey() && getApiSecret() && getStateSecret());
}

export function isValidShopDomain(shop: string): boolean {
  return /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop);
}

const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes — plenty for a user to approve the Shopify install screen

// Signed, self-contained state token: businessId.expiry.hmac — avoids needing
// a separate "pending OAuth state" DB table just to survive the redirect round trip.
export function signState(businessId: string): string {
  const secret = getStateSecret();
  if (!secret) throw new Error('SHOPIFY_STATE_SECRET is not configured');
  const expiry = Date.now() + STATE_TTL_MS;
  const payload = `${businessId}.${expiry}`;
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

export function verifyState(state: string): string | null {
  const secret = getStateSecret();
  if (!secret) return null;
  const parts = state.split('.');
  if (parts.length !== 3) return null;
  const [businessId, expiryStr, sig] = parts;
  const payload = `${businessId}.${expiryStr}`;
  const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  const sigBuf = Buffer.from(sig, 'hex');
  const expectedBuf = Buffer.from(expectedSig, 'hex');
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  const expiry = Number(expiryStr);
  if (!Number.isFinite(expiry) || Date.now() > expiry) return null;

  return businessId;
}

// Shopify's documented OAuth callback verification: HMAC-SHA256 over all query
// params except `hmac`/`signature`, sorted and joined as key=value&key=value.
export function verifyOAuthCallbackHmac(searchParams: URLSearchParams): boolean {
  const secret = getApiSecret();
  if (!secret) return false;

  const hmac = searchParams.get('hmac');
  if (!hmac) return false;

  const pairs: string[] = [];
  for (const [key, value] of searchParams.entries()) {
    if (key === 'hmac' || key === 'signature') continue;
    pairs.push(`${key}=${value}`);
  }
  pairs.sort();
  const message = pairs.join('&');

  const computed = crypto.createHmac('sha256', secret).update(message).digest('hex');
  const computedBuf = Buffer.from(computed, 'hex');
  const hmacBuf = Buffer.from(hmac, 'hex');
  return computedBuf.length === hmacBuf.length && crypto.timingSafeEqual(computedBuf, hmacBuf);
}

export function buildAuthorizeUrl(shop: string, redirectUri: string, state: string): string {
  const apiKey = getApiKey();
  const params = new URLSearchParams({
    client_id: apiKey || '',
    scope: 'read_products',
    redirect_uri: redirectUri,
    state,
  });
  return `https://${shop}/admin/oauth/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(shop: string, code: string): Promise<{ access_token: string; scope: string }> {
  const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: getApiKey(),
      client_secret: getApiSecret(),
      code,
    }),
  });
  if (!res.ok) {
    throw new Error(`Shopify token exchange failed: ${res.status}`);
  }
  return res.json();
}

export interface ShopifyVariant {
  id: number;
  sku: string | null;
  price: string;
  inventory_quantity: number;
  barcode: string | null;
}

export interface ShopifyProduct {
  id: number;
  title: string;
  product_type: string | null;
  variants: ShopifyVariant[];
}

// v1: first page only (250 items, Shopify's max per page). Pagination via the
// Link header is a known follow-up for stores with larger catalogs.
export async function fetchProducts(shopDomain: string, accessToken: string): Promise<ShopifyProduct[]> {
  const res = await fetch(`https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/products.json?limit=250`, {
    headers: { 'X-Shopify-Access-Token': accessToken },
  });
  if (!res.ok) {
    throw new Error(`Shopify products fetch failed: ${res.status}`);
  }
  const data = await res.json();
  return data.products || [];
}
