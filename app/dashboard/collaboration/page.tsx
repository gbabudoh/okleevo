"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import PusherClient, { type Channel } from 'pusher-js';
import {
  Video, Phone, MessageSquare,
  Loader2, ShieldCheck, UsersRound, Send, X,
  Radio, Search, LayoutGrid, List
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
  image?: string | null;
  isOnline: boolean;
  lastActivity: string;
}

interface ChatMessage {
  id: string;
  businessId?: string;
  senderId: string;
  receiverId: string;
  content: string;
  senderName?: string;
  senderRole?: string | null;
  senderImage?: string | null;
  isRead?: boolean;
  createdAt: string;
}

const AVATAR_GRADIENTS = [
  'from-orange-500 to-amber-600',
  'from-indigo-600 to-violet-600',
  'from-blue-600 to-cyan-600',
  'from-emerald-600 to-teal-600',
  'from-purple-600 to-pink-600',
  'from-amber-600 to-rose-600',
];

function CollaborationHubInner() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const pusherRef = useRef<PusherClient | null>(null);

  // Real-time push (Pusher)
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
      const channelName = activeChatMember.userId === 'GROUP_MAIN_HQ'
        ? 'private-chat-GROUP_MAIN_HQ'
        : `private-chat-${[myId, activeChatMember.userId].sort().join('-')}`;

      channel = pusherRef.current.subscribe(channelName);
      channel.bind('new-message', () => fetchChatMessages(activeChatMember.userId));
    }

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

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeChatMember || !newMessageContent.trim()) return;

    const content = newMessageContent.trim();
    setNewMessageContent('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const optimisticMsg: ChatMessage = {
      id: 'temp_' + Date.now(),
      senderId: session?.user?.id || 'me',
      receiverId: activeChatMember.userId,
      content,
      senderName: session?.user?.name || 'You',
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
  const filteredTeam = team.filter(m =>
    `${m.firstName} ${m.lastName} ${m.email} ${m.role}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 md:pb-12 text-slate-900 dark:text-slate-100">
      <TourProvider moduleId="collaboration" steps={collaborationTourSteps} />

      {/* ── Enterprise Workspace Header ── */}
      <div id="tour-collaboration-header" className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="p-4 bg-orange-50 dark:bg-orange-950/50 border border-orange-200/60 dark:border-orange-900/50 rounded-2xl shrink-0 text-orange-600 dark:text-orange-400 shadow-xs">
              <UsersRound className="w-7 h-7 stroke-[1.75]" />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Team Collaboration Workspace
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80">
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
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl font-normal leading-relaxed">
                Encrypted HD video meetings, voice huddles, and persistent team chat scoped exclusively to your organization domain.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>{onlineCount} of {team.length} Active Members</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── HQ Room Pod (sole entry point for org-wide room) ── */}
      <div className="rounded-3xl bg-gradient-to-r from-orange-50/70 via-white to-amber-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-850 border border-orange-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">HQ ROOM · BROADCAST READY</span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
                General HQ Main Room
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Instant HD video & voice meeting room for all team members.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setActiveChatMember({
                  userId: 'GROUP_MAIN_HQ',
                  firstName: 'General HQ',
                  lastName: 'Team Channel',
                  email: 'Company-Wide Realtime Chat',
                  role: 'HQ CHANNEL',
                  isOnline: true,
                  lastActivity: 'Now',
                });
              }}
              className="px-4 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Team Group Chat</span>
            </button>
            <button
              onClick={() => startMeeting('general_hq', false, true)}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Phone className="w-4 h-4 text-orange-500" />
              <span>Voice Huddle</span>
            </button>
            <button
              onClick={() => startMeeting('general_hq', true, true)}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-md shadow-orange-500/20 active:scale-95 cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>Join Video Call</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Team Directory Section ── */}
      <div id="tour-collaboration-team" className="space-y-4">
        
        {/* Directory Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2.5">
            <UsersRound className="w-5 h-5 text-orange-500" />
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              Organization Team Directory
            </h2>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 font-mono">
              {team.length} Member{team.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-2xs font-extrabold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
                <span className="hidden md:inline">List</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-2xs font-extrabold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden md:inline">Grid</span>
              </button>
            </div>

            {/* Search Field */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search team members..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Directory List / Grid Container */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Syncing team presence...</p>
          </div>
        ) : filteredTeam.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center p-6">
            <UsersRound className="w-10 h-10 text-slate-300 dark:text-slate-700" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No matching team members found</h3>
            <p className="text-xs text-slate-400 max-w-sm">Try searching with a different name or role.</p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View Layout */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTeam.map((member, idx) => {
              const gradient = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];
              return (
                <div
                  key={member.userId}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 flex flex-col items-center text-center justify-between gap-4 shadow-2xs hover:border-orange-400/80 transition-all group"
                >
                  <div className="flex flex-col items-center text-center min-w-0 w-full">
                    <div className="relative mb-3">
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={`${member.firstName} ${member.lastName}`}
                          className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                        />
                      ) : (
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-lg font-extrabold shadow-sm`}>
                          {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                        </div>
                      )}
                      <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                        member.isOnline ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-slate-300 dark:bg-slate-700'
                      }`} />
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white break-words leading-tight w-full">
                      {member.firstName} {member.lastName}
                    </h3>
                    
                    <span className="mt-1 text-[10px] font-mono font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {member.role || 'Member'}
                    </span>

                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-2 font-medium w-full">
                      {member.email}
                    </p>

                    <p className="text-[11px] font-bold mt-1">
                      {member.isOnline ? <span className="text-emerald-600 dark:text-emerald-400 font-bold">● Online</span> : <span className="text-slate-400">Offline</span>}
                    </p>
                  </div>

                  {/* Grid Action Dock */}
                  <div className="grid grid-cols-3 gap-1.5 w-full pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <button
                      onClick={() => startMeeting(`call_${member.userId}`, true, true)}
                      className="py-2 px-1 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-orange-100/80 dark:hover:bg-orange-950/60 hover:text-orange-600 text-slate-700 dark:text-slate-200 font-extrabold text-[11px] flex flex-col items-center justify-center gap-1 cursor-pointer transition-all border border-slate-200/60 dark:border-slate-700"
                      title="Video Call"
                    >
                      <Video className="w-3.5 h-3.5 text-orange-500" />
                      <span>Video</span>
                    </button>
                    <button
                      onClick={() => startMeeting(`call_${member.userId}`, false, true)}
                      className="py-2 px-1 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-100/80 dark:hover:bg-emerald-950/60 hover:text-emerald-600 text-slate-700 dark:text-slate-200 font-extrabold text-[11px] flex flex-col items-center justify-center gap-1 cursor-pointer transition-all border border-slate-200/60 dark:border-slate-700"
                      title="Voice Call"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Voice</span>
                    </button>
                    <button
                      onClick={() => setActiveChatMember(member)}
                      className="py-2 px-1 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-100/80 dark:hover:bg-indigo-950/60 hover:text-indigo-600 text-slate-700 dark:text-slate-200 font-extrabold text-[11px] flex flex-col items-center justify-center gap-1 cursor-pointer transition-all border border-slate-200/60 dark:border-slate-700"
                      title="Direct Chat"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Chat</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View Layout */
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden shadow-xs">
            {filteredTeam.map((member, idx) => {
              const gradient = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];
              return (
                <div
                  key={member.userId}
                  className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-orange-50/30 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Left: Member info with image avatar or gradient fallback */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative shrink-0">
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={`${member.firstName} ${member.lastName}`}
                          className="w-11 h-11 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                        />
                      ) : (
                        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-sm font-extrabold shadow-sm`}>
                          {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                        </div>
                      )}
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                        member.isOnline ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-slate-300 dark:bg-slate-700'
                      }`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-slate-900 dark:text-white break-words">
                          {member.firstName} {member.lastName}
                        </p>
                        <span className="text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          {member.role || 'Member'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
                        {member.email} • {member.isOnline ? <span className="text-emerald-600 font-bold">Online</span> : <span className="text-slate-400">Offline</span>}
                      </p>
                    </div>
                  </div>

                  {/* Right: Micro Action Dock */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => startMeeting(`call_${member.userId}`, true, true)}
                      className="px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-orange-100/70 dark:hover:bg-orange-950/50 hover:text-orange-600 dark:hover:text-orange-400 transition-all font-semibold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-200/80 dark:border-slate-700"
                      title="Start Video Call"
                    >
                      <Video className="w-4 h-4 text-orange-500" />
                      <span className="hidden sm:inline">Video</span>
                    </button>
                    <button
                      onClick={() => startMeeting(`call_${member.userId}`, false, true)}
                      className="px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/50 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all font-semibold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-200/80 dark:border-slate-700"
                      title="Start Voice Call"
                    >
                      <Phone className="w-4 h-4 text-emerald-500" />
                      <span className="hidden sm:inline">Voice</span>
                    </button>
                    <button
                      onClick={() => setActiveChatMember(member)}
                      className="px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-indigo-100/70 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-semibold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-200/80 dark:border-slate-700"
                      title="Open Direct Chat"
                    >
                      <MessageSquare className="w-4 h-4 text-indigo-500" />
                      <span className="hidden sm:inline">Chat</span>
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
                  {activeChatMember.image ? (
                    <img
                      src={activeChatMember.image}
                      alt={`${activeChatMember.firstName} ${activeChatMember.lastName}`}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                      {activeChatMember.firstName.charAt(0)}{activeChatMember.lastName.charAt(0)}
                    </div>
                  )}
                  {activeChatMember.isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
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
                  <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
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
                  const isMe = msg.senderId === session?.user?.id || msg.senderId === 'me';
                  const member = team.find(t => t.userId === msg.senderId);
                  const senderName = isMe 
                    ? 'You' 
                    : (msg.senderName || (member ? `${member.firstName} ${member.lastName}`.trim() : activeChatMember.firstName || 'Team Member'));
                  const role = msg.senderRole || member?.role;

                  return (
                    <div 
                      key={msg.id} 
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-200`}
                    >
                      <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
                        isMe 
                          ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-tr-none font-medium' 
                          : 'bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-tl-none font-medium'
                      }`}>
                        {/* Sender Name Header */}
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={`text-[11px] font-extrabold tracking-tight ${
                            isMe 
                              ? 'text-orange-100/90' 
                              : 'text-orange-600 dark:text-orange-400'
                          }`}>
                            {senderName}
                          </span>
                          {!isMe && role && (
                            <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                              {role}
                            </span>
                          )}
                        </div>

                        <p className="leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-[9px] font-medium mt-1 text-right ${
                          isMe ? 'text-orange-100/80' : 'text-slate-400'
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
              className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-end gap-2 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]"
            >
              <textarea 
                ref={textareaRef}
                rows={1}
                value={newMessageContent}
                onChange={(e) => {
                  setNewMessageContent(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                placeholder={`Message ${activeChatMember.firstName}... (Shift+Enter for newline)`}
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-950 transition-all text-slate-900 dark:text-white resize-none max-h-28 min-h-[42px] leading-relaxed [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden font-normal"
              />
              <button 
                type="submit"
                disabled={!newMessageContent.trim()}
                className="p-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:bg-slate-100 dark:disabled:bg-slate-900 text-white disabled:text-slate-400 rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer shrink-0 mb-0.5"
                title="Send message (Enter)"
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
