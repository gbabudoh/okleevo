"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Video, Phone, MessageSquare,
  Loader2, ShieldCheck, UsersRound, Lock, Send, X
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
  'from-violet-500 to-indigo-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-emerald-500 to-teal-600',
  'from-sky-500 to-blue-600',
  'from-fuchsia-500 to-purple-600',
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

    const interval = setInterval(() => {
      fetchChatMessages(activeChatMember.userId);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeChatMember]);

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
        setActiveMeeting({ token: data.token, wsUrl: data.wsUrl, room: data.room, video, audio });
      }
    } catch (err) {
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
          onLeave={() => setActiveMeeting(null)}
        />
      </div>
    );
  }

  const onlineCount = team.filter(m => m.isOnline).length;

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-24 md:pb-10">

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-indigo-600 via-indigo-700 to-violet-800 p-6 sm:p-8 text-white shadow-xl shadow-indigo-200/40">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 left-12 w-40 h-40 bg-violet-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-white/15 rounded-lg">
                <UsersRound className="w-4 h-4 text-white" />
              </div>
              <span className="text-indigo-200 text-[10px] font-black uppercase tracking-widest">Private Team Network</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight mb-1">
              Team Collaboration
            </h1>
            <p className="text-indigo-300 text-sm font-medium">Okleevo Secure Workspace</p>
          </div>

          <div className="flex flex-col gap-2.5 sm:items-end">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3.5 py-2 border border-white/20 self-start sm:self-auto">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm font-black text-white">
                {onlineCount} / {team.length} online
              </span>
            </div>
            <button
              onClick={() => startMeeting('general_hq', true, true)}
              className="flex items-center justify-center gap-2 bg-white text-indigo-700 font-black text-sm rounded-xl px-5 py-2.5 shadow-lg hover:bg-indigo-50 active:scale-95 transition-all w-full sm:w-auto cursor-pointer"
            >
              <Video className="w-4 h-4" />
              General Meeting
            </button>
          </div>
        </div>
      </div>

      {/* ── Security Banner ── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-xl">
        <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
        <p className="text-xs font-bold text-indigo-800/80 leading-relaxed">
          <span className="text-indigo-600">End-to-end encrypted.</span>{' '}
          All communication is locked to your organisation and never shared externally.
        </p>
      </div>

      {/* ── Team Grid ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Your Team</h2>
          <span className="text-xs font-bold text-gray-400">{team.length} member{team.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Syncing Team…</p>
          </div>
        ) : team.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-2xl border border-gray-100">
            <UsersRound className="w-10 h-10 text-gray-200" />
            <p className="text-sm font-bold text-gray-400">No team members yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {team.map((member, idx) => {
              const gradient = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];
              return (
                <div
                  key={member.userId}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-gray-100 transition-all group cursor-pointer"
                >
                  {/* Card body */}
                  <div className="flex items-center gap-4 p-4 pb-3">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${gradient} flex items-center justify-center text-white text-xl font-black shadow-md`}>
                        {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                      </div>
                      {member.isOnline && (
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                      )}
                    </div>

                    {/* Identity */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-black text-gray-900 truncate leading-tight">
                        {member.firstName} {member.lastName}
                      </h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide truncate mt-0.5">
                        {member.role || 'Team Member'}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${member.isOnline ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-wider ${member.isOnline ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {member.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-2 px-4 pb-4">
                    <button
                      onClick={() => startMeeting(`call_${member.userId}`, true, true)}
                      className="flex flex-col items-center gap-1 py-2.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-xl transition-all active:scale-95 cursor-pointer"
                    >
                      <Video className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase tracking-wide">Video</span>
                    </button>
                    <button
                      onClick={() => startMeeting(`call_${member.userId}`, false, true)}
                      className="flex flex-col items-center gap-1 py-2.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-xl transition-all active:scale-95 cursor-pointer"
                    >
                      <Phone className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase tracking-wide">Voice</span>
                    </button>
                    <button
                      onClick={() => setActiveChatMember(member)}
                      className="flex flex-col items-center gap-1 py-2.5 bg-amber-50 hover:bg-amber-500 text-amber-600 hover:text-white rounded-xl transition-all active:scale-95 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase tracking-wide">Chat</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Feature Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
        <div className="relative overflow-hidden bg-indigo-600 rounded-2xl p-5 text-white group cursor-pointer">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
          <Video className="w-7 h-7 mb-3 text-indigo-300" />
          <h4 className="font-black mb-1 text-base">Instant Meetings</h4>
          <p className="text-indigo-200 text-xs leading-relaxed">HD video calls with screen sharing and encrypted audio.</p>
        </div>

        <div className="relative overflow-hidden bg-gray-900 rounded-2xl p-5 text-white group cursor-pointer">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
          <MessageSquare className="w-7 h-7 mb-3 text-indigo-400" />
          <h4 className="font-black mb-1 text-base">Encrypted Chat</h4>
          <p className="text-gray-400 text-xs leading-relaxed">Secure team messaging with persistent history and file sharing.</p>
        </div>

        <div className="relative overflow-hidden bg-white border border-gray-100 rounded-2xl p-5 group cursor-pointer">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-amber-50 rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
          <Lock className="w-7 h-7 mb-3 text-amber-500" />
          <h4 className="font-black mb-1 text-base text-gray-900">Total Privacy</h4>
          <p className="text-gray-500 text-xs leading-relaxed">Locked to your organisation domain and never shared externally.</p>
        </div>
      </div>

      {/* ── Chat Drawer ── */}
      {activeChatMember && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity"
            onClick={() => setActiveChatMember(null)}
          />
          
          {/* Drawer container */}
          <div className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white dark:bg-slate-950 shadow-2xl border-l border-slate-100 dark:border-slate-800 z-50 flex flex-col animate-in slide-in-from-right duration-300">
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
                  <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
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
        </>
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
