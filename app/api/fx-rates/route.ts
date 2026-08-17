import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';

// Live GBP-base exchange rates from the European Central Bank via Frankfurter
// (free, no key required). Cached in-memory for an hour so the currency
// selector doesn't trigger a live fetch on every render — this is a
// module-level cache, so it's shared across requests within the same server
// process and reset on restart/redeploy, which is fine for a display-only
// FX rate that only needs to be "roughly current," not real-time.
const CACHE_TTL_MS = 60 * 60 * 1000;

let cache: { base: 'GBP'; rates: Record<string, number>; fetchedAt: string } | null = null;
let cacheTime = 0;

export const GET = withMultiTenancy(async () => {
  const now = Date.now();

  if (cache && now - cacheTime < CACHE_TTL_MS) {
    return NextResponse.json({ ...cache, stale: false });
  }

  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=GBP&to=USD,EUR', {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`Frankfurter responded ${res.status}`);
    const data = await res.json();
    if (!data?.rates?.USD || !data?.rates?.EUR) throw new Error('Malformed rate response');

    cache = { base: 'GBP', rates: { GBP: 1, USD: data.rates.USD, EUR: data.rates.EUR }, fetchedAt: new Date().toISOString() };
    cacheTime = now;

    return NextResponse.json({ ...cache, stale: false });
  } catch (error) {
    console.error('[FX Rates] Live fetch failed:', error instanceof Error ? error.message : error);
    if (cache) {
      // Serve the last known-good rate rather than nothing, but say so honestly.
      return NextResponse.json({ ...cache, stale: true });
    }
    return NextResponse.json({ error: 'Exchange rates are currently unavailable' }, { status: 502 });
  }
});
