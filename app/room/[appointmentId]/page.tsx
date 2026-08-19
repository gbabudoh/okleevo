"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, AlertCircle, Sparkles, ShieldCheck, FileText, Download } from 'lucide-react';
import MeetingRoom from '@/components/collaboration/MeetingRoom';

interface SharedAsset {
  id: string;
  file_name: string;
  download_url: string;
}

interface VerifyResponse {
  access_granted: boolean;
  webrtc_room_id?: string;
  webrtc_token?: string;
  ws_url?: string;
  expires_in_seconds?: number;
  shared_assets?: SharedAsset[];
  asset_token?: string;
  error?: string;
}

async function downloadSharedAsset(asset: SharedAsset, assetToken: string) {
  const res = await fetch(asset.download_url, {
    headers: { Authorization: `Bearer ${assetToken}` },
  });
  if (!res.ok) return;
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = asset.file_name;
  a.click();
  URL.revokeObjectURL(url);
}

function SharedAssetsSidebar({ assets, assetToken }: { assets: SharedAsset[]; assetToken: string }) {
  if (assets.length === 0) return null;
  return (
    <div className="w-full lg:w-72 shrink-0 bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
      <h2 className="text-xs font-bold uppercase tracking-widest text-white/50 px-1 mb-2">Shared Files</h2>
      {assets.map((asset) => (
        <button
          key={asset.id}
          onClick={() => downloadSharedAsset(asset, assetToken)}
          className="w-full flex items-center gap-2 px-3 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-left transition-colors"
        >
          <FileText className="w-4 h-4 text-white/60 shrink-0" />
          <span className="text-sm text-white/80 truncate flex-1">{asset.file_name}</span>
          <Download className="w-3.5 h-3.5 text-white/40 shrink-0" />
        </button>
      ))}
    </div>
  );
}

export default function GuestRoomPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const [pin, setPin] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<VerifyResponse | null>(null);
  const [left, setLeft] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setError(null);
    try {
      const res = await fetch('/api/public/video-rooms/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointment_id: appointmentId, entered_pin: pin }),
      });
      const data: VerifyResponse = await res.json();
      if (!res.ok || !data.access_granted) {
        throw new Error(data.error || 'Invalid code');
      }
      setSession(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setVerifying(false);
    }
  };

  if (left) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-10 text-center space-y-4">
          <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
          <h1 className="text-2xl font-bold text-white">You&apos;ve left the meeting</h1>
          <p className="text-white/50">Thanks for meeting with us — you can safely close this tab.</p>
        </div>
      </div>
    );
  }

  if (session?.access_granted && session.webrtc_token && session.ws_url) {
    return (
      <div className="min-h-screen bg-gray-950 p-4 md:p-6">
        <div className="max-w-6xl mx-auto h-[calc(100vh-3rem)] flex flex-col lg:flex-row gap-4">
          <div className="flex-1 min-h-0">
            <MeetingRoom
              token={session.webrtc_token}
              wsUrl={session.ws_url}
              onLeave={() => setLeft(true)}
              video
              audio
            />
          </div>
          {session.shared_assets && session.asset_token && (
            <SharedAssetsSidebar assets={session.shared_assets} assetToken={session.asset_token} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 space-y-8">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-900/50">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">OKLEEVO<span className="text-indigo-400">.</span></span>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-white">Enter your access code</h1>
          <p className="text-white/50 text-sm">Check your booking confirmation email for the 6-digit code.</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <input
            required
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            className="w-full text-center text-3xl font-black tracking-[0.5em] py-5 bg-white/5 border-2 border-white/10 rounded-2xl focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all text-white placeholder-white/20"
            placeholder="······"
          />

          {error && (
            <div className="flex items-start gap-2 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={verifying || pin.length !== 6}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {verifying ? <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</> : 'Join Meeting'}
          </button>
        </form>
      </div>
    </div>
  );
}
