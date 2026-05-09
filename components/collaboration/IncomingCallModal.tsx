"use client";

import { useState, useEffect, useRef } from 'react';
import { Phone, Video, X, PhoneIncoming } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface CallNotification {
  id: string;
  type: string;
  status: string;
  metadata: {
    roomName: string;
    type: 'video' | 'voice';
    senderId: string;
    senderName: string;
  };
}

export default function IncomingCallModal() {
  const [call, setCall] = useState<CallNotification | null>(null);
  const callRef = useRef<CallNotification | null>(null);
  const router = useRouter();
  const { data: session } = useSession();

  // Keep ref in sync with state
  useEffect(() => {
    callRef.current = call;
  }, [call]);

  useEffect(() => {
    if (!session?.user?.id) return;

    // Poll for CALL_INVITE notifications every 3 seconds (increased frequency)
    const checkCalls = async () => {
      try {
        const res = await fetch('/api/notifications?limit=5');
        if (res.ok) {
          const notifications: CallNotification[] = await res.json();
          
          // Find unread call invites NOT from myself (Case-insensitive check)
          const latestCall = notifications.find((n) => 
            (n.type?.toUpperCase() === 'CALL_INVITE') && 
            n.status === 'unread' &&
            n.metadata?.senderId !== session?.user?.id
          );
          
          if (latestCall) {
            // If we have a call, and it's different from the current one, show it
            if (!callRef.current || latestCall.id !== callRef.current.id) {
              setCall(latestCall);
            }
          } else if (callRef.current) {
            // If the call was read/dismissed elsewhere, clear it here
            setCall(null);
          }
        }
      } catch (err) {
        console.error('IncomingCall: Poll error', err);
      }
    };

    const interval = setInterval(checkCalls, 3000);
    checkCalls(); // Initial check
    return () => clearInterval(interval);
  }, [session?.user?.id]);

  if (!call) return null;

  const handleAccept = async () => {
    // Mark as read
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: call.id, status: 'read' })
    });

    const metadata = call.metadata;
    setCall(null);
    
    // Navigate to collaboration hub with the room name
    router.push(`/dashboard/collaboration?room=${metadata.roomName}&type=${metadata.type}`);
  };

  const handleDecline = async () => {
    // Just mark as read/dismissed
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: call.id, status: 'read' })
    });
    setCall(null);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[9999] animate-in fade-in slide-in-from-bottom-10 duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border-4 border-indigo-600 p-6 w-80 overflow-hidden relative">
        {/* Animated Background Ring */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full opacity-50 animate-ping" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <PhoneIncoming className="w-7 h-7 text-white animate-bounce" />
            </div>
            <div>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Incoming Call</p>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {call.metadata?.senderName || 'Team Member'}
              </h3>
            </div>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Wants to start a {call.metadata?.type} session with you.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleDecline}
              className="flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl font-bold transition-all text-sm cursor-pointer"
            >
              <X className="w-4 h-4" />
              Decline
            </button>
            <button 
              onClick={handleAccept}
              className="flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all text-sm shadow-lg shadow-indigo-100 cursor-pointer"
            >
              {call.metadata?.type === 'video' ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
