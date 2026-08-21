"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, AlertCircle, ShieldCheck, FileText, Download, Lock, Video } from 'lucide-react';
import MeetingRoom, { AppointmentMeta } from '@/components/collaboration/MeetingRoom';

interface SharedAsset {
  id: string;
  file_name: string;
  download_url: string;
}

interface VerifyResponse {
  access_granted: boolean;
  is_host?: boolean;
  webrtc_room_id?: string;
  webrtc_token?: string;
  ws_url?: string;
  expires_in_seconds?: number;
  appointment?: {
    id: string;
    title: string;
    clientName?: string;
    clientEmail?: string;
    businessName?: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
  };
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
          className="w-full flex items-center gap-2 px-3 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-left transition-colors cursor-pointer"
        >
          <FileText className="w-4 h-4 text-white/60 shrink-0" />
          <span className="text-sm text-white/80 truncate flex-1">{asset.file_name}</span>
          <Download className="w-3.5 h-3.5 text-white/40 shrink-0" />
        </button>
      ))}
    </div>
  );
}

export default function GuestRoomPage({ params: _params }: { params?: Promise<{ appointmentId: string }> }) {
  const routerParams = useParams();
  const appointmentId = (routerParams?.appointmentId as string) || '';
  const [pin, setPin] = useState('');
  const [initialChecking, setInitialChecking] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<VerifyResponse | null>(null);
  const [left, setLeft] = useState(false);

  // Check if authenticated SME Host is visiting their own room
  useEffect(() => {
    let isMounted = true;
    async function checkHostAccess() {
      try {
        const res = await fetch(`/api/video-rooms/${appointmentId}/host-join`);
        if (res.ok) {
          const data: VerifyResponse = await res.json();
          if (isMounted && data.access_granted && data.webrtc_token) {
            setSession(data);
          }
        }
      } catch {
        // Not logged in or not host — fallback to guest PIN verification
      } finally {
        if (isMounted) setInitialChecking(false);
      }
    }

    if (appointmentId) {
      checkHostAccess();
    } else {
      setInitialChecking(false);
    }

    return () => {
      isMounted = false;
    };
  }, [appointmentId]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setError(null);
    try {
      const res = await fetch('/api/public/video-rooms/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointment_id: appointmentId, entered_pin: pin.trim() }),
      });
      const data: VerifyResponse = await res.json();
      if (!res.ok || !data.access_granted) {
        throw new Error(data.error || 'Invalid 6-digit code');
      }
      setSession(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid 6-digit code');
    } finally {
      setVerifying(false);
    }
  };

  if (left) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-10 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white">Meeting Concluded</h1>
          <p className="text-white/60 text-sm">Thanks for meeting with us — you can safely close this tab.</p>
        </div>
      </div>
    );
  }

  if (initialChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 gap-4">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
        <p className="text-white/60 font-mono text-xs uppercase tracking-widest">Checking Room Access…</p>
      </div>
    );
  }

  const handleLeave = () => {
    if (appointmentId) {
      fetch(`/api/public/video-rooms/${appointmentId}/conclude`, { method: 'POST' }).catch(() => {});
    }
    setLeft(true);
  };

  if (session?.access_granted && session.webrtc_token && session.ws_url) {
    const appointmentMeta: AppointmentMeta = {
      title: session.appointment?.title || 'Video Appointment',
      businessName: session.appointment?.businessName,
      clientName: session.appointment?.clientName,
      durationMinutes: session.appointment?.durationMinutes || 30,
      isHost: Boolean(session.is_host),
    };

    return (
      <div className="min-h-screen bg-slate-950 p-2 sm:p-4 md:p-6 flex flex-col justify-center">
        <div className="max-w-7xl mx-auto w-full h-[calc(100vh-2rem)] sm:h-[calc(100vh-3rem)] flex flex-col lg:flex-row gap-4">
          <div className="flex-1 min-h-0 h-full">
            <MeetingRoom
              token={session.webrtc_token}
              wsUrl={session.ws_url}
              onLeave={handleLeave}
              video
              audio
              appointmentMeta={appointmentMeta}
            />
          </div>
          {session.shared_assets && session.asset_token && session.shared_assets.length > 0 && (
            <SharedAssetsSidebar assets={session.shared_assets} assetToken={session.asset_token} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 space-y-8 relative z-10 shadow-2xl">
        <div className="flex items-center justify-center gap-2.5">
          <div className="p-2.5 bg-orange-500 text-white rounded-xl shadow-lg shadow-orange-500/30">
            <Video className="w-5 h-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">
            Okleevo <span className="text-orange-400 font-mono text-sm">Meeting</span>
          </span>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black text-white tracking-tight">Enter your access code</h1>
          <p className="text-white/50 text-xs sm:text-sm">
            Please enter the 6-digit PIN sent in your booking confirmation email.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-5">
          <div className="space-y-2">
            <div className="relative">
              <input
                required
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                autoFocus
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, ''));
                  setError(null);
                }}
                className="w-full text-center text-3xl font-mono font-black tracking-[0.4em] py-4 bg-white/5 border-2 border-white/15 rounded-2xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-white placeholder-white/20"
                placeholder="000000"
              />
            </div>
            <p className="text-[11px] text-white/40 font-mono text-center">
              Direct in-browser connection • No account needed
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={verifying || pin.length !== 6}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-2xl font-extrabold text-sm hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {verifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying PIN...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Unlock & Join Meeting</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
