import React, { useState, useEffect } from "react";
import {
  LiveKitRoom,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  TrackToggle,
  DisconnectButton,
  useTracks,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import { Loader2, Mic, Video, ScreenShare, PhoneOff, Clock, ShieldCheck, AlertTriangle } from "lucide-react";

export interface AppointmentMeta {
  title?: string;
  businessName?: string;
  durationMinutes?: number;
  isHost?: boolean;
  clientName?: string;
}

interface MeetingRoomProps {
  token: string;
  wsUrl: string;
  onLeave: () => void;
  video: boolean;
  audio: boolean;
  appointmentMeta?: AppointmentMeta;
}

function InCallTimer({
  elapsedSeconds,
  durationMinutes = 30,
}: {
  elapsedSeconds: number;
  durationMinutes?: number;
}) {
  const totalScheduledSeconds = durationMinutes * 60;
  const remainingSeconds = Math.max(0, totalScheduledSeconds - elapsedSeconds);
  const isTimeUp = elapsedSeconds >= totalScheduledSeconds;
  const isNearEnd = remainingSeconds <= 300 && !isTimeUp; // 5 minutes or less

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2">
      {/* Time status badge */}
      <div
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold backdrop-blur-md border transition-all ${
          isTimeUp
            ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
            : isNearEnd
            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse'
            : 'bg-white/10 border-white/15 text-white/90'
        }`}
      >
        <Clock className="w-3.5 h-3.5 shrink-0" />
        <span>{formatTime(elapsedSeconds)}</span>
        <span className="text-white/40 font-normal">/</span>
        <span className="text-white/70">{formatTime(totalScheduledSeconds)}</span>
      </div>

      {/* Warning pill if 5 min or less */}
      {isNearEnd && (
        <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-[11px] font-bold text-amber-300">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          <span>{Math.ceil(remainingSeconds / 60)}m left</span>
        </div>
      )}

      {isTimeUp && (
        <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-rose-500/20 border border-rose-500/30 rounded-full text-[11px] font-bold text-rose-300">
          <span>Time Ended</span>
        </div>
      )}
    </div>
  );
}

function VideoLayout({ onLeave, appointmentMeta }: { onLeave: () => void; appointmentMeta?: AppointmentMeta }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isConcluding, setIsConcluding] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const durationMinutes = appointmentMeta?.durationMinutes || 30;
  const totalScheduledSeconds = durationMinutes * 60;

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // When timer reaches scheduled limit, initiate automatic conclusion
  useEffect(() => {
    if (elapsedSeconds >= totalScheduledSeconds && !isConcluding) {
      setIsConcluding(true);
    }
  }, [elapsedSeconds, totalScheduledSeconds, isConcluding]);

  // Grace countdown before calling onLeave
  useEffect(() => {
    if (!isConcluding) return;
    if (countdown <= 0) {
      onLeave();
      return;
    }
    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [isConcluding, countdown, onLeave]);

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  return (
    <div className="flex flex-col h-full relative">
      {/* Auto-Expiration Concluding Overlay */}
      {isConcluding && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white/10 border border-white/20 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto animate-bounce">
              <Clock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Scheduled Time Concluded</h2>
            <p className="text-white/70 text-xs leading-relaxed">
              Your scheduled {durationMinutes}-minute appointment window has finished.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/40 rounded-full text-xs font-mono font-bold text-orange-300">
              <span>Closing video room in {countdown}s…</span>
            </div>
          </div>
        </div>
      )}

      {/* Top Header Overlay */}
      <div className="shrink-0 bg-gray-950/80 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between z-40">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
            O
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-[180px] sm:max-w-xs">
                {appointmentMeta?.title || 'Video Appointment'}
              </h1>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${
                  appointmentMeta?.isHost
                    ? 'bg-orange-500/20 border border-orange-500/40 text-orange-300'
                    : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                }`}
              >
                {appointmentMeta?.isHost ? 'Host' : 'Guest'}
              </span>
            </div>
            {appointmentMeta?.businessName && (
              <p className="text-[11px] text-white/50 truncate">
                {appointmentMeta.businessName} {appointmentMeta.clientName ? `• with ${appointmentMeta.clientName}` : ''}
              </p>
            )}
          </div>
        </div>

        {/* In-Call Timer */}
        <InCallTimer
          elapsedSeconds={elapsedSeconds}
          durationMinutes={durationMinutes}
        />
      </div>

      {/* Video grid */}
      <div className="flex-1 min-h-0 overflow-hidden bg-gray-950">
        <GridLayout tracks={tracks} style={{ height: "100%" }}>
          <ParticipantTile />
        </GridLayout>
      </div>

      <RoomAudioRenderer />

      {/* Mobile-first control bar */}
      <div className="shrink-0 bg-gray-950/95 backdrop-blur-md border-t border-white/10 px-4 py-4 safe-area-bottom">
        <div className="flex items-center justify-center gap-4 max-w-xs mx-auto">
          {/* Mic toggle */}
          <TrackToggle
            source={Track.Source.Microphone}
            showIcon={false}
            className="lk-mobile-btn"
          >
            <Mic className="w-5 h-5 text-white" />
          </TrackToggle>

          {/* Camera toggle */}
          <TrackToggle
            source={Track.Source.Camera}
            showIcon={false}
            className="lk-mobile-btn"
          >
            <Video className="w-5 h-5 text-white" />
          </TrackToggle>

          {/* Screen share — hidden on small screens, shown on sm+ */}
          <TrackToggle
            source={Track.Source.ScreenShare}
            showIcon={false}
            className="lk-mobile-btn hidden sm:flex"
          >
            <ScreenShare className="w-5 h-5 text-white" />
          </TrackToggle>

          {/* Leave button */}
          <DisconnectButton
            onClick={onLeave}
            className="lk-mobile-btn lk-mobile-btn--leave"
          >
            <PhoneOff className="w-5 h-5 text-white" />
          </DisconnectButton>
        </div>
      </div>
    </div>
  );
}

export default function MeetingRoom({ token, wsUrl, onLeave, video, audio, appointmentMeta }: MeetingRoomProps) {
  if (!token || !wsUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
          Connecting to Secure Server…
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-gray-900 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-white/10">
      <LiveKitRoom
        video={video}
        audio={audio}
        token={token}
        serverUrl={wsUrl}
        connect={true}
        onDisconnected={onLeave}
        onError={(e) => {
          const msg = e?.message ?? '';
          if (!msg || msg.toLowerCase().includes('offer')) return;
          console.error('LiveKit error:', e);
          if (msg.includes('expired') || msg.includes('unauthorized') || msg.includes('failed to connect')) {
            setTimeout(onLeave, 3000);
          }
        }}
        data-lk-theme="default"
        className="h-full"
      >
        <VideoLayout onLeave={onLeave} appointmentMeta={appointmentMeta} />
      </LiveKitRoom>
    </div>
  );
}
