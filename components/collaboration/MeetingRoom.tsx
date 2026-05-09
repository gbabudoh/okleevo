"use client";

import {
  LiveKitRoom,
  VideoConference,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Loader2, X } from "lucide-react";

interface MeetingRoomProps {
  token: string;
  wsUrl: string;
  onLeave: () => void;
  video: boolean;
  audio: boolean;
}

export default function MeetingRoom({ token, wsUrl, onLeave, video, audio }: MeetingRoomProps) {
  if (!token || !wsUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Connecting to Secure Server…</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-gray-900 rounded-3xl overflow-hidden shadow-2xl">
      {/* Okleevo Branding Overlay */}
      <div className="absolute top-6 left-6 z-50 flex items-center gap-2 pointer-events-none opacity-50">
        <div className="w-8 h-8 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/10">
            <span className="text-white font-black text-xs">O</span>
        </div>
        <span className="text-white font-black tracking-tighter text-sm uppercase">Okleevo Secure Meeting</span>
      </div>

      <button 
        onClick={onLeave}
        className="absolute top-6 right-6 z-50 p-3 bg-white/10 hover:bg-rose-500/80 backdrop-blur-md rounded-2xl transition-all cursor-pointer group"
      >
        <X className="w-5 h-5 text-white group-hover:scale-110" />
      </button>

      <LiveKitRoom
        video={video}
        audio={audio}
        token={token}
        serverUrl={wsUrl}
        connect={true}
        onDisconnected={onLeave}
        onError={(e) => {
          console.error("LiveKit Connection Error:", e);
          // Auto-leave if connection fails critically
          if (e.message.includes("offer") || e.message.includes("connect")) {
            setTimeout(onLeave, 3000);
          }
        }}
        data-lk-theme="default"
        className="h-full"
      >
        <VideoConference />
      </LiveKitRoom>
    </div>
  );
}
