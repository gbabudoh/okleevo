"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import PusherClient, { type Channel } from 'pusher-js';
import {
  Video, Phone, MessageSquare,
  Loader2, ShieldCheck, UsersRound, Send, X,
} from 'lucide-react';
import MeetingRoom from '@/components/collaboration/MeetingRoom';
import { startOutgoingRingtone, stopOutgoingRingtone } from '@/lib/audio/ringtone';
import TourProvider from '@/components/tours/TourProvider';
import { ModuleGuideBanner } from '@/components/tours/ModuleGuideBanner';
import { collaborationTourSteps } from './tour-steps';

interface TeamMember {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isOnline: boolean;
  lastActivity: string;
}

interface ChatMessage {
  id: string;
  businessId?: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead?: boolean;
  createdAt: string;
}

const AVATAR_GRADIENTS = [
  'from-indigo-600 to-violet-600',
  'from-blue-600 to-cyan-600',
  'from-purple-600 to-pink-600',
  'from-emerald-600 to-teal-600',
  'from-amber-600 to-orange-600',
  'from-rose-600 to-red-600',
];

function CollaborationHubInner() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMeeting, setActiveMeeting] = useState<{
    token: string;
    wsUrl: string;
    room: string;
    video: boolean;
    audio: boolean;
  } | null>(null);

  // ── Chat State ──
  const [activeChatMember, setActiveChatMember] = useState<TeamMember | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessageContent, setNewMessageContent] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const pusherRef = useRef<PusherClient | null>(null);

  // Real-time push (Pusher) — purely a "something changed" signal; message
  // data always comes from fetchChatMessages below. If NEXT_PUBLIC_PUSHER_*
  // isn't configured, this is a no-op and chat behaves exactly as it did
  // before (3s polling), matching lib/services/realtime.ts's server-side
  // no-op fallback.
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!key || !cluster) return;

    pusherRef.current = new PusherClient(key, { cluster, authEndpoint: '/api/pusher/auth' });

    return () => {
      pusherRef.current?.disconnect();
      pusherRef.current = null;
    };
  }, []);

  const fetchChatMessages = async (targetId: string) => {
    try {
      const res = await fetch(`/api/collaboration/chat?targetUserId=${targetId}`);
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data);
      }
    } catch (err) {
      console.error('Failed to fetch chat messages:', err);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (!activeChatMember) return;
    setLoadingChat(true);
    fetchChatMessages(activeChatMember.userId).finally(() => setLoadingChat(false));

    const myId = session?.user?.id;
    let channel: Channel | null = null;
    if (pusherRef.current && myId) {
      const [a, b] = [myId, activeChatMember.userId].sort();
      channel = pusherRef.current.subscribe(`private-chat-${a}-${b}`);
      channel.bind('new-message', () => fetchChatMessages(activeChatMember.userId));
    }

    // Polling is now a fallback, not the primary mechanism, once realtime
    // push is live — a much longer interval is enough to recover from a
    // dropped/missed event. Without Pusher configured this stays the sole
    // delivery mechanism, at its original 3s cadence.
    const pollMs = channel ? 20000 : 3000;
    const interval = setInterval(() => {
      fetchChatMessages(activeChatMember.userId);
    }, pollMs);

    return () => {
      clearInterval(interval);
      if (channel) {
        channel.unbind('new-message');
        pusherRef.current?.unsubscribe(channel.name);
      }
    };
  }, [activeChatMember, session?.user?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatMember || !newMessageContent.trim()) return;

    const content = newMessageContent.trim();
    setNewMessageContent('');

    // Optimistic UI updates
    const optimisticMsg = {
      id: 'temp_' + Date.now(),
      senderId: session?.user?.id || 'me',
      receiverId: activeChatMember.userId,
      content,
      createdAt: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, optimisticMsg]);

    try {
      const res = await fetch('/api/collaboration/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: activeChatMember.userId, content })
      });
      if (res.ok) {
        fetchChatMessages(activeChatMember.userId);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

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
    const interval = setInterval(fetchTeam, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const roomParam = searchParams.get('room');
    const typeParam = searchParams.get('type');
    if (roomParam) {
      startMeeting(roomParam, typeParam === 'video', true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams]);

  useEffect(() => {
    const chatParam = searchParams.get('chat');
    if (chatParam && team.length > 0) {
      const member = team.find(t => t.userId === chatParam);
      if (member) {
        setActiveChatMember(member);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [searchParams, team]);

  const startMeeting = async (roomName: string, video = true, audio = true) => {
    try {
      if (roomName.startsWith('call_')) {
        startOutgoingRingtone();
      }
      const res = await fetch(`/api/livekit/token?room=${roomName}`);
      if (res.ok) {
        const data = await res.json();
        if (roomName.startsWith('call_')) {
          const targetUserId = roomName.replace('call_', '');
          await fetch('/api/collaboration/call', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetUserId, roomName, type: video ? 'video' : 'voice' }),
          });
        }
        stopOutgoingRingtone();
        setActiveMeeting({ token: data.token, wsUrl: data.wsUrl, room: data.room, video, audio });
      } else {
        stopOutgoingRingtone();
      }
    } catch (err) {
      stopOutgoingRingtone();
      console.error('Failed to start meeting:', err);
    }
  };

  if (activeMeeting) {
    return (
      <div className="h-[calc(100dvh-220px)] md:h-[calc(100dvh-140px)] flex flex-col">
        <MeetingRoom
          token={activeMeeting.token}
          wsUrl={activeMeeting.wsUrl}
          video={activeMeeting.video}
          audio={activeMeeting.audio}
          onLeave={() => {
            stopOutgoingRingtone();
            setActiveMeeting(null);
          }}
        />
      </div>
    );
  }

  const onlineCount = team.filter(m => m.isOnline).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24 md:pb-12 text-slate-900 dark:text-slate-100">
      <TourProvider moduleId="collaboration" steps={collaborationTourSteps} />

      {/* ── Enterprise Workspace Header ── */}
      <div id="tour-collaboration-header" className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 rounded-xl shrink-0 text-indigo-600 dark:text-indigo-400 shadow-xs">
              <UsersRound className="w-6 h-6 stroke-[1.75]" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Team Collaboration Workspace
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  E2E Encrypted Org
                </span>
                <ModuleGuideBanner
                  moduleId="collaboration"
                  moduleName="Collaboration Hub"
                  summary="Connect with team members in real-time via HD video calls, voice, or direct messaging."
                  tips={[
                    "Click Video/Voice to initiate direct team calls",
                    "Real-time incoming call alerts with audio ringtone",
                    "Business-scoped room security with instant joining"
                  ]}
                />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
                Encrypted HD video meetings, voice huddles, and persistent team chat scoped exclusively to your organization domain.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{onlineCount} of {team.length} Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── HQ Room Card (sole entry point for the org-wide room) ── */}
      <div className="rounded-2xl bg-indigo-50/60 border border-indigo-100 p-5 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
              <Video className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">HQ Room · Ready</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
                General HQ Main Room
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => startMeeting('general_hq', false, true)}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-indigo-500" />
              <span>Voice Huddle</span>
            </button>
            <button
              onClick={() => startMeeting('general_hq', true, true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Join Video Call</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Team Section Header & Grid ── */}
      <div id="tour-collaboration-team" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UsersRound className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight">
              Organization Team Directory
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
            {team.length} Member{team.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Syncing presence...</p>
          </div>
        ) : team.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center p-6">
            <UsersRound className="w-10 h-10 text-slate-300 dark:text-slate-700" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No team members available</h3>
            <p className="text-xs text-slate-400 max-w-sm">Invite team members to your organization to start collaborating in real-time.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
            {team.map((member, idx) => {
              const gradient = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];
              return (
                <div
                  key={member.userId}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className={`w-9 h-9 rounded-lg bg-linear-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold`}>
                      {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${
                      member.isOnline ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`} />
                  </div>

                  {/* Name, role, status */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {member.role || 'Member'} · {member.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>

                  {/* Icon-only actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => startMeeting(`call_${member.userId}`, true, true)}
                      className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                      title="Start Video Call"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => startMeeting(`call_${member.userId}`, false, true)}
                      className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                      title="Start Voice Call"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActiveChatMember(member)}
                      className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                      title="Open Direct Chat"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Chat Drawer ── */}
      {activeChatMember && (
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 transition-opacity flex items-center justify-center p-4 sm:block sm:p-0"
          onClick={() => setActiveChatMember(null)}
        >
          {/* Drawer container */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`relative sm:fixed sm:top-0 sm:right-0 w-full sm:w-[450px] ${
              isInputFocused ? 'h-[58dvh] -translate-y-2' : 'h-[88dvh] -translate-y-6'
            } sm:h-full bg-white dark:bg-slate-950 shadow-2xl border border-slate-100 dark:border-slate-800 rounded-2xl sm:rounded-none z-50 flex flex-col transform sm:translate-y-0 transition-all duration-300 ease-in-out animate-in fade-in zoom-in-95 sm:slide-in-from-right`}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                    {activeChatMember.firstName.charAt(0)}{activeChatMember.lastName.charAt(0)}
                  </div>
                  {activeChatMember.isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                    {activeChatMember.firstName} {activeChatMember.lastName}
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide">
                    {activeChatMember.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={() => setActiveChatMember(null)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50 dark:bg-slate-900/20 custom-scrollbar">
              {loadingChat && chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  <p className="text-xs font-bold uppercase tracking-widest text-[9px]">Loading chat history...</p>
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 gap-3 text-slate-400 dark:text-slate-600">
                  <MessageSquare className="w-10 h-10 stroke-[1.5]" />
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No messages yet</p>
                    <p className="text-[10px] leading-relaxed mt-0.5">Start a secure internal conversation with {activeChatMember.firstName} now!</p>
                  </div>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isMe = msg.senderId === session?.user?.id;
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-200`}
                    >
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
                        isMe 
                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                          : 'bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-tl-none'
                      }`}>
                        <p className="leading-relaxed break-words">{msg.content}</p>
                        <p className={`text-[9px] font-medium mt-1 text-right ${
                          isMe ? 'text-indigo-200' : 'text-slate-400'
                        }`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>
            
            {/* Input Footer */}
            <form 
              onSubmit={handleSendMessage}
              className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center gap-2 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]"
            >
              <input 
                type="text" 
                value={newMessageContent}
                onChange={(e) => setNewMessageContent(e.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                placeholder={`Message ${activeChatMember.firstName}...`}
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all text-slate-900 dark:text-white"
              />
              <button 
                type="submit"
                disabled={!newMessageContent.trim()}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-slate-900 text-white disabled:text-slate-400 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CollaborationHub() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="animate-pulse text-gray-400 text-sm font-bold uppercase tracking-widest">Loading collaboration…</div></div>}>
      <CollaborationHubInner />
    </Suspense>
  );
}

