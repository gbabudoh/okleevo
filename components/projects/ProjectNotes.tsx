"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Send, Trash2, Loader2, MessageSquare } from 'lucide-react';

interface Note {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; firstName: string; lastName: string } | null;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const datePart = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const timePart = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return `${datePart} at ${timePart}`;
}

export default function ProjectNotes({ projectId, notes, onRefresh }: { projectId: string; notes: Note[]; onRefresh: () => void }) {
  const { data: session } = useSession();
  const myId = session?.user?.id;

  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);

  const handlePost = async () => {
    if (!draft.trim()) return;
    setPosting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: draft.trim() }),
      });
      if (res.ok) {
        setDraft('');
        onRefresh();
      }
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    if (res.ok) onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2">
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handlePost();
            }
          }}
          placeholder="Post an update or note about this project…"
          rows={2}
          className="flex-1 resize-none px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition"
        />
        <button
          type="button"
          disabled={posting || !draft.trim()}
          onClick={handlePost}
          className="shrink-0 p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer"
          title="Post note"
        >
          {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="w-8 h-8 text-slate-200 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No updates yet. Post the first note above.</p>
        </div>
      ) : (
        <div className="border-t border-slate-100">
          {notes.map(n => {
            const isMe = n.author?.id === myId;
            const initials = n.author ? `${n.author.firstName[0]}${n.author.lastName[0]}` : '?';
            return (
              <div key={n.id} className="group py-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                    {initials}
                  </div>
                  <span className="text-sm font-bold text-slate-900">{n.author ? `${n.author.firstName} ${n.author.lastName}` : 'Unknown'}</span>
                  <span className="text-xs text-slate-400">{formatDateTime(n.createdAt)}</span>
                  {isMe && (
                    <button
                      type="button"
                      onClick={() => handleDelete(n.id)}
                      className="ml-auto p-1 text-slate-300 hover:text-rose-500 rounded transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap wrap-break-word pl-8">{n.body}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
