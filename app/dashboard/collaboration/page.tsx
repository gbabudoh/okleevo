"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Video, Phone, MessageSquare, 
  Loader2, Sparkles, ShieldCheck,
  Info, UsersRound
} from 'lucide-react';
import MeetingRoom from '@/components/collaboration/MeetingRoom';

interface TeamMember {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isOnline: boolean;
  lastActivity: string;
}

export default function CollaborationHub() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMeeting, setActiveMeeting] = useState<{
    token: string;
    wsUrl: string;
    room: string;
    video: boolean;
    audio: boolean;
  } | null>(null);

  const fetchTeam = async () => {
    try {
      const res = await fetch('/api/presence');
      if (res.ok) {
        const data = await res.json();
        setTeam(data.presence);
      }
    } catch (err) {
      console.error('Failed to fetch team:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
    const interval = setInterval(fetchTeam, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Heartbeat every 15 seconds to stay "Online"
    const interval = setInterval(async () => {
      await fetch('/api/presence', { method: 'POST' });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // 🚀 Reactive URL listener: Auto-join call from URL params
    const roomParam = searchParams.get('room');
    const typeParam = searchParams.get('type');
    
    if (roomParam) {
      console.log('Incoming call detected in URL, joining...', roomParam);
      startMeeting(roomParam, typeParam === 'video', true);
      // Clean up URL without triggering re-render of this effect
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]); // Now reacts to URL changes!

  const startMeeting = async (roomName: string, video: boolean = true, audio: boolean = true) => {
    try {
      const res = await fetch(`/api/livekit/token?room=${roomName}`);
      if (res.ok) {
        const data = await res.json();
        
        // 🚀 NEW: Send a call ping to the target user
        if (roomName.startsWith('call_')) {
          const targetUserId = roomName.replace('call_', '');
          await fetch('/api/collaboration/call', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              targetUserId,
              roomName: roomName, // Use raw room name to avoid double-scoping
              type: video ? 'video' : 'voice'
            })
          });
        }

        setActiveMeeting({
          token: data.token,
          wsUrl: data.wsUrl,
          room: data.room,
          video,
          audio
        });
      }
    } catch (err) {
      console.error('Failed to start meeting:', err);
    }
  };

  if (activeMeeting) {
    return (
      <div className="h-[calc(100vh-140px)] flex flex-col">
        <MeetingRoom 
          token={activeMeeting.token}
          wsUrl={activeMeeting.wsUrl}
          video={activeMeeting.video}
          audio={activeMeeting.audio}
          onLeave={() => setActiveMeeting(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-wider mb-4">
             <ShieldCheck className="w-3.5 h-3.5" />
             Private Team Network
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <UsersRound className="w-6 h-6 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Team Collaboration</h1>
          </div>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Okleevo Secure Workspace</p>
        </div>

        <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm font-black text-gray-600">
                {team.filter(m => m.isOnline).length} of {team.length} online
              </span>
            </div>
            <button 
              onClick={() => startMeeting('general_hq', true, true)}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 transition-all active:scale-95"
            >
              General Meeting
            </button>
        </div>
      </div>

      {/* ── Status Banner ── */}
      <div className="p-4 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-indigo-100 shadow-sm">
             <Info className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-sm font-bold text-indigo-900/70">
            <span className="font-black text-indigo-600">Collaboration Enabled:</span> All team members can see and share business data within your organization.
          </p>
      </div>

      {/* ── Team Grid ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
           <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
           <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Syncing Team Data…</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {team.map((member) => (
            <div 
              key={member.userId}
              className="bg-white rounded-[2.5rem] border border-gray-100 p-8 hover:shadow-2xl hover:shadow-indigo-100/30 transition-all flex flex-col items-center text-center relative group"
            >
               {/* Avatar Section */}
               <div className="relative mb-6">
                 <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-black shadow-2xl ring-4 ring-white">
                    {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                 </div>
                 {member.isOnline && (
                   <div className="absolute bottom-1 right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <div className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
                   </div>
                 )}
               </div>
               
               {/* Name & Status */}
               <div className="mb-8">
                  <h3 className="text-xl font-black text-gray-900 mb-2">
                    {member.firstName} {member.lastName}
                  </h3>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
                    <div className={`w-2 h-2 rounded-full ${member.isOnline ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {member.isOnline ? 'Online Now' : 'Offline'}
                    </span>
                  </div>
               </div>

               {/* 🚀 High-Visibility Communication Hub */}
               <div className="grid grid-cols-3 gap-2 w-full pt-6 border-t border-gray-100">
                  <button 
                    onClick={() => startMeeting(`call_${member.userId}`, true, true)}
                    className="flex flex-col items-center gap-1.5 p-3 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-[1.25rem] transition-all group/btn shadow-sm"
                  >
                    <Video className="w-5 h-5" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">Video</span>
                  </button>
                  
                  <button 
                    onClick={() => startMeeting(`call_${member.userId}`, false, true)}
                    className="flex flex-col items-center gap-1.5 p-3 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-[1.25rem] transition-all group/btn shadow-sm"
                  >
                    <Phone className="w-5 h-5" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">Voice</span>
                  </button>
                  
                  <button 
                    className="flex flex-col items-center gap-1.5 p-3 bg-amber-50 hover:bg-amber-600 text-amber-600 hover:text-white rounded-[1.25rem] transition-all group/btn shadow-sm"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">Chat</span>
                  </button>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Features ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
          <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform" />
             <Video className="w-10 h-10 mb-6 text-indigo-300" />
             <h4 className="text-xl font-black mb-2">Instant Meetings</h4>
             <p className="text-indigo-100 font-medium text-sm leading-relaxed">High-definition video calls with screen sharing and encrypted audio.</p>
          </div>
          <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform" />
             <MessageSquare className="w-10 h-10 mb-6 text-indigo-400" />
             <h4 className="text-xl font-black mb-2">Encrypted Chat</h4>
             <p className="text-gray-400 font-medium text-sm leading-relaxed">Secure team messaging with persistent history and file sharing capabilities.</p>
          </div>
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 relative overflow-hidden group">
             <Sparkles className="w-10 h-10 mb-6 text-amber-500" />
             <h4 className="text-xl font-black mb-2 text-gray-900">Total Privacy</h4>
             <p className="text-gray-500 font-medium text-sm leading-relaxed">Communication is locked to your organization domain and never shared.</p>
          </div>
      </div>
    </div>
  );
}
