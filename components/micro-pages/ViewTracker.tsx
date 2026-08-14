"use client";

import { useEffect } from 'react';

export function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    fetch('/api/micro-pages/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
      keepalive: true,
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
