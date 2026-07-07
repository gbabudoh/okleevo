"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2, MailX } from 'lucide-react';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(token ? 'loading' : 'error');

  useEffect(() => {
    if (!token) return;
    fetch(`/api/unsubscribe?token=${encodeURIComponent(token)}`)
      .then(res => setStatus(res.ok ? 'success' : 'error'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-sm w-full text-center space-y-4">
        {status === 'loading' && (
          <>
            <Loader2 className="w-10 h-10 text-gray-300 mx-auto animate-spin" />
            <p className="text-gray-500 font-medium">Processing your request…</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h1 className="text-lg font-bold text-gray-900">You&apos;ve been unsubscribed</h1>
            <p className="text-sm text-gray-500">You won&apos;t receive further marketing emails from this business.</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-400 mx-auto" />
            <h1 className="text-lg font-bold text-gray-900">Link invalid or expired</h1>
            <p className="text-sm text-gray-500">We couldn&apos;t process this unsubscribe request.</p>
          </>
        )}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 pt-2">
          <MailX className="w-4 h-4" /> Back to Okleevo
        </Link>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense>
      <UnsubscribeContent />
    </Suspense>
  );
}
