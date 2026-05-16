"use client";

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
import { Loader2, Mic, Video, ScreenShare, PhoneOff } from "lucide-react";

interface MeetingRoomProps {
  token: string;
  wsUrl: string;
  onLeave: () => void;
  video: boolean;
  audio: boolean;
}

function VideoLayout({ onLeave }: { onLeave: () => void }) {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  return (
    <div className="flex flex-col h-full">
      {/* Video grid */}
      <div className="flex-1 min-h-0 overflow-hidden">
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

export default function MeetingRoom({ token, wsUrl, onLeave, video, audio }: MeetingRoomProps) {
  if (!token || !wsUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
          Connecting to Secure Server…
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-gray-900 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl">
      {/* Branding overlay */}
      <div className="absolute top-3 left-3 md:top-5 md:left-5 z-50 flex items-center gap-2 pointer-events-none opacity-40">
        <div className="w-7 h-7 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/10">
          <span className="text-white font-black text-xs">O</span>
        </div>
        <span className="hidden sm:block text-white font-black tracking-tighter text-xs uppercase">
          Okleevo Secure
        </span>
      </div>

      <LiveKitRoom
        video={video}
        audio={audio}
        token={token}
        serverUrl={wsUrl}
        connect={true}
        onDisconnected={onLeave}
        onError={(e) => {
          const msg = e?.message ?? '';
          // "unable to set offer" is a transient WebRTC SDP negotiation error —
          // LiveKit retries internally, so we let it recover on its own.
          if (!msg || msg.toLowerCase().includes('offer')) return;
          console.error('LiveKit error:', e);
          // Only auto-leave on auth / unrecoverable failures
          if (msg.includes('expired') || msg.includes('unauthorized') || msg.includes('failed to connect')) {
            setTimeout(onLeave, 3000);
          }
        }}
        data-lk-theme="default"
        className="h-full"
      >
        <VideoLayout onLeave={onLeave} />
      </LiveKitRoom>
    </div>
  );
}
