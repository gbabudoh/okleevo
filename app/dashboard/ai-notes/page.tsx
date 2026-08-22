"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  FileText, Plus, Search, Star, Pin,
  Calendar, Users, Sparkles, Download,
  CheckSquare, LayoutGrid, List, TrendingUp,
  Lightbulb, X, ChevronRight, Copy,
  Mic, Video, BookOpen, Trash2, Loader2,
  ShieldCheck, StickyNote, PenTool, Send,
  Sliders, Layers, Tag, ArrowUpRight, Maximize2
} from 'lucide-react';

interface TeamMemberOption {
  userId: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  type: 'meeting' | 'brainstorm' | 'document' | 'task' | 'research' | 'personal' | 'posted';
  date: Date;
  tags: string[];
  isPinned: boolean;
  isStarred: boolean;
  isPrivate?: boolean;
  authorName?: string;
  lastEditedBy?: string;
  lastEditedAt?: string | Date;
  color?: string; // For Post-It sticky notes
  aiSummary?: string;
  actionItems?: string[];
  participants?: string[];
  duration?: string;
}

const STICKY_COLORS = [
  { id: 'yellow', name: 'Cyber Yellow', bg: 'bg-amber-100 dark:bg-amber-950/70', border: 'border-amber-300 dark:border-amber-800', text: 'text-amber-950 dark:text-amber-100', badge: 'bg-amber-200 text-amber-900' },
  { id: 'pink', name: 'Electric Pink', bg: 'bg-rose-100 dark:bg-rose-950/70', border: 'border-rose-300 dark:border-rose-800', text: 'text-rose-950 dark:text-rose-100', badge: 'bg-rose-200 text-rose-900' },
  { id: 'mint', name: 'Mint Green', bg: 'bg-emerald-100 dark:bg-emerald-950/70', border: 'border-emerald-300 dark:border-emerald-800', text: 'text-emerald-950 dark:text-emerald-100', badge: 'bg-emerald-200 text-emerald-900' },
  { id: 'blue', name: 'Ice Blue', bg: 'bg-sky-100 dark:bg-sky-950/70', border: 'border-sky-300 dark:border-sky-800', text: 'text-sky-950 dark:text-sky-100', badge: 'bg-sky-200 text-sky-900' },
  { id: 'lavender', name: 'Soft Lavender', bg: 'bg-purple-100 dark:bg-purple-950/70', border: 'border-purple-300 dark:border-purple-800', text: 'text-purple-950 dark:text-purple-100', badge: 'bg-purple-200 text-purple-900' },
];

const availableEngines: { id: 'deep' | 'fast'; name: string; description: string }[] = [
  { id: 'fast', name: 'On-Device NLP Engine', description: 'Zero-cost instant executive summaries & action item parsing ($0.00 API cost)' },
  { id: 'deep', name: 'Deep Extraction NLP', description: 'Comprehensive sentence centrality & commitment extraction' },
];

const NOTE_TYPES = [
  { id: 'meeting',    name: 'Meeting',    icon: Users,       gradient: 'from-blue-500 to-cyan-500',     accent: 'bg-blue-50 text-blue-600 border-blue-100'   },
  { id: 'brainstorm', name: 'Brainstorm', icon: Lightbulb,   gradient: 'from-yellow-500 to-orange-500', accent: 'bg-amber-50 text-amber-600 border-amber-100' },
  { id: 'document',   name: 'Document',   icon: FileText,    gradient: 'from-purple-500 to-pink-500',   accent: 'bg-purple-50 text-purple-600 border-purple-100' },
  { id: 'posted',     name: 'Posted Sticky', icon: StickyNote, gradient: 'from-amber-400 to-yellow-500', accent: 'bg-amber-50 text-amber-600 border-amber-100' },
  { id: 'task',       name: 'Tasks',      icon: CheckSquare, gradient: 'from-green-500 to-emerald-500', accent: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  { id: 'research',   name: 'Research',   icon: BookOpen,    gradient: 'from-indigo-500 to-purple-500', accent: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
  { id: 'personal',   name: 'Personal',   icon: Star,        gradient: 'from-pink-500 to-rose-500',     accent: 'bg-rose-50 text-rose-600 border-rose-100'   },
];

const getType = (id: string) => NOTE_TYPES.find(t => t.id === id) ?? NOTE_TYPES[0];

const inputCls = "w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400";
const labelCls = "block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1";

export default function AINotesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [notes, setNotes]                   = useState<Note[]>([]);
  const [loading, setLoading]               = useState(true);
  const [viewMode, setViewMode]             = useState<'grid' | 'posted' | 'table'>('grid');
  const [searchQuery, setSearchQuery]       = useState('');
  const [selectedType, setSelectedType]     = useState('all');
  const [scopeFilter, setScopeFilter]       = useState<'all' | 'shared' | 'private'>('all');
  const [showNewModal, setShowNewModal]     = useState(false);
  const [selectedNote, setSelectedNote]     = useState<Note | null>(null);
  const [isEditingSelected, setIsEditingSelected] = useState(false);
  const [editTitle, setEditTitle]           = useState('');
  const [editContent, setEditContent]       = useState('');
  const [editIsPrivate, setEditIsPrivate]   = useState(false);
  const [savingEdit, setSavingEdit]         = useState(false);
  const [showAIAssist, setShowAIAssist]     = useState(true);
  const [newNoteType, setNewNoteType]       = useState<'meeting' | 'brainstorm' | 'document' | 'task' | 'research' | 'personal' | 'posted'>('document');
  const [newStickyColor, setNewStickyColor] = useState('yellow');
  const [newIsPrivate, setNewIsPrivate]     = useState(false);
  const [selectedEngine, setSelectedEngine] = useState<'deep' | 'fast'>(availableEngines[0].id);
  const [copied, setCopied]                 = useState(false);
  const [newTitle, setNewTitle]             = useState('');
  const [newContent, setNewContent]         = useState('');
  const [newTags, setNewTags]               = useState('');
  const [teamMembers, setTeamMembers]       = useState<TeamMemberOption[]>([]);
  const [assignedMember, setAssignedMember] = useState('');
  const [creatingNote, setCreatingNote]     = useState(false);
  const [assistError, setAssistError]       = useState<string | null>(null);
  const [showStarredOnly, setShowStarredOnly] = useState(false);

  // Persistent floating scratchpad drawer
  const [scratchpadOpen, setScratchpadOpen]   = useState(false);
  const [scratchpadText, setScratchpadText]   = useState('');

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch('/api/ai-notes');
      if (res.ok) {
        const data: (Omit<Note, 'date'> & { date: string })[] = await res.json();
        setNotes(data.map(n => ({ ...n, date: new Date(n.date) })));
      }
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  useEffect(() => {
    fetch('/api/presence')
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.presence || []);
        if (Array.isArray(list) && list.length > 0) setTeamMembers(list);
      })
      .catch(() => setTeamMembers([]));
  }, []);

  useEffect(() => {
    if (!assignedMember && session?.user?.id) setAssignedMember(session.user.id);
  }, [assignedMember, session?.user?.id]);

  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      const q = searchQuery.toLowerCase();
      const matchSearch = n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tags.some(t => t.toLowerCase().includes(q));
      const matchType = selectedType === 'all' || n.type === selectedType;
      const matchStarred = showStarredOnly ? n.isStarred : true;
      const matchScope =
        scopeFilter === 'all'
          ? true
          : scopeFilter === 'private'
          ? Boolean(n.isPrivate)
          : !n.isPrivate;
      return matchSearch && matchType && matchStarred && matchScope;
    });
  }, [notes, searchQuery, selectedType, showStarredOnly, scopeFilter]);

  const pinnedNotes  = filteredNotes.filter(n =>  n.isPinned);
  const regularNotes = filteredNotes.filter(n => !n.isPinned);

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/ai-notes/${id}`, { method: 'DELETE' });
    if (res.ok) setNotes(prev => prev.filter(n => n.id !== id));
  };

  const handleToggleStar = async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    const res = await fetch(`/api/ai-notes/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isStarred: !note.isStarred }),
    });
    if (res.ok) {
      const u: Omit<Note, 'date'> & { date: string } = await res.json();
      setNotes(prev => prev.map(n => n.id === id ? { ...u, date: new Date(u.date) } : n));
    }
  };

  const handleTogglePin = async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    const res = await fetch(`/api/ai-notes/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPinned: !note.isPinned }),
    });
    if (res.ok) {
      const u: Omit<Note, 'date'> & { date: string } = await res.json();
      setNotes(prev => prev.map(n => n.id === id ? { ...u, date: new Date(u.date) } : n));
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedNote || !editTitle.trim()) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/ai-notes/${selectedNote.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          content: editContent.trim(),
          isPrivate: editIsPrivate,
        }),
      });
      if (res.ok) {
        const updated: Omit<Note, 'date'> & { date: string } = await res.json();
        const parsed = { ...updated, date: new Date(updated.date) };
        setNotes(prev => prev.map(n => n.id === parsed.id ? parsed : n));
        setSelectedNote(parsed);
        setIsEditingSelected(false);
      }
    } catch {
      /* silent */
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setCreatingNote(true);
    setAssistError(null);

    let aiSummary: string | null = null;
    let actionItems: string[] = [];

    if (showAIAssist) {
      try {
        const assistRes = await fetch('/api/ai-notes/assist', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: newTitle.trim(), content: newContent.trim(), model: selectedEngine }),
        });
        if (assistRes.ok) {
          const assist = await assistRes.json();
          aiSummary = assist.summary;
          actionItems = assist.actionItems;
        } else {
          const err = await assistRes.json().catch(() => null);
          setAssistError(err?.error || 'AI assist failed. Saving note without a summary.');
        }
      } catch {
        setAssistError('AI assist failed. Saving note without a summary.');
      }
    }

    const assignee = teamMembers.find(m => m.userId === assignedMember);
    const res = await fetch('/api/ai-notes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTitle.trim(), content: newContent.trim(), type: newNoteType,
        color: newNoteType === 'posted' ? newStickyColor : undefined,
        tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
        isPrivate: newIsPrivate,
        aiSummary, actionItems,
        participants: assignee ? [`${assignee.firstName} ${assignee.lastName}`] : [],
      }),
    });
    setCreatingNote(false);
    if (res.ok) {
      const c: Omit<Note, 'date'> & { date: string } = await res.json();
      setNotes(prev => [{ ...c, date: new Date(c.date) }, ...prev]);
      setShowNewModal(false);
      setNewTitle(''); setNewContent(''); setNewTags(''); setNewIsPrivate(false); setAssistError(null);
    }
  };

  const handleCopy = (note: Note) => {
    navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (note: Note) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([`${note.title}\n\n${note.content}`], { type: 'text/plain' }));
    a.download = `${note.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.txt`;
    a.click();
  };

  const exportToTasks = () => {
    router.push('/dashboard/tasks');
  };

  /* ── Posted Sticky Card Component ───────────────────────────────── */
  const StickyPostCard = ({ note }: { note: Note }) => {
    const colorObj = STICKY_COLORS.find(c => c.id === (note.color || 'yellow')) || STICKY_COLORS[0];

    return (
      <div
        onClick={() => {
          setSelectedNote(note);
          setEditTitle(note.title);
          setEditContent(note.content);
          setEditIsPrivate(Boolean(note.isPrivate));
          setIsEditingSelected(false);
        }}
        className={`group relative p-5 rounded-2xl border ${colorObj.bg} ${colorObj.border} shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between min-h-[200px] font-sans`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <StickyNote className="w-4 h-4 text-amber-700 dark:text-amber-300 shrink-0" />
            <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${colorObj.badge}`}>
              POSTED
            </span>
            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md ${note.isPrivate ? 'bg-amber-200 text-amber-900 dark:bg-amber-900/80 dark:text-amber-200' : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200'}`}>
              {note.isPrivate ? '🔒 Private' : '🌐 Shared'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={e => { e.stopPropagation(); handleToggleStar(note.id); }}
              className="p-1 hover:bg-black/5 rounded-lg transition-colors cursor-pointer"
            >
              <Star className={`w-3.5 h-3.5 ${note.isStarred ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
            </button>
          </div>
        </div>

        <div className="my-3 space-y-1.5 flex-1">
          <h3 className={`text-sm font-bold line-clamp-2 ${colorObj.text}`}>
            {note.title}
          </h3>
          <p className={`text-xs font-medium line-clamp-4 leading-relaxed opacity-90 ${colorObj.text}`}>
            {note.content}
          </p>
        </div>

        <div className="pt-2 border-t border-black/5 flex flex-col gap-1 text-[10px] font-bold opacity-75">
          <div className="flex items-center justify-between">
            <span className="truncate">By {note.authorName || 'Team Member'}</span>
            <span>{note.date.toLocaleDateString()}</span>
          </div>
          {note.lastEditedBy && (
            <span className="text-[9px] text-slate-500 italic truncate">
              Updated by {note.lastEditedBy}
            </span>
          )}
        </div>
      </div>
    );
  };

  /* ── Notion Document Card Component ─────────────────────────────── */
  const NoteCard = ({ note }: { note: Note }) => {
    const tc = getType(note.type);
    const Icon = tc.icon;

    if (note.type === 'posted' || viewMode === 'posted') {
      return <StickyPostCard note={note} />;
    }

    return (
      <div
        onClick={() => {
          setSelectedNote(note);
          setEditTitle(note.title);
          setEditContent(note.content);
          setEditIsPrivate(Boolean(note.isPrivate));
          setIsEditingSelected(false);
        }}
        className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 hover:border-orange-300 dark:hover:border-orange-900/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${tc.gradient} flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
              note.isPrivate
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60'
                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/60'
            }`}>
              {note.isPrivate ? '🔒 Private' : '🌐 Shared'}
            </span>
            {note.isPinned && <Pin className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />}
            <button
              onClick={e => { e.stopPropagation(); handleToggleStar(note.id); }}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <Star className={`w-4 h-4 ${note.isStarred ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
            </button>
          </div>
        </div>

        <div className="space-y-1.5 flex-1">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
            {note.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-3">
            {note.content || 'No content yet.'}
          </p>
        </div>

        {note.aiSummary && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-950/60 rounded-xl border border-orange-200/60 dark:border-orange-900/40">
            <Sparkles className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
            <p className="text-[10px] font-bold text-orange-700 dark:text-orange-300 truncate">{note.aiSummary}</p>
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate">
              👤 {note.authorName || 'Team Member'}
            </span>
            <span className="text-[10px] font-extrabold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 px-2 py-0.5 rounded-full border border-orange-200/60">
              {tc.name}
            </span>
          </div>
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
            <span>{note.date.toLocaleDateString()} {note.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            {note.lastEditedBy && <span className="text-slate-400 italic">Updated by {note.lastEditedBy}</span>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen space-y-6 pb-24 sm:pb-12 text-slate-900 dark:text-slate-100">

      {/* ── Enterprise Header Shell ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-50/70 via-white to-amber-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-850 border border-orange-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="p-4 bg-orange-500 text-white rounded-2xl shrink-0 shadow-md">
              <FileText className="w-7 h-7 stroke-[2]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Notes & Knowledge Operating System
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/80">
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
                  Okleevo Neural Engine v2.0
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl font-normal leading-relaxed">
                Notion-grade document workspace, color-coded Post-it boards, and Okleevo AI summary synthesis.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => { setNewNoteType('posted'); setShowNewModal(true); }}
              className="px-4 py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs rounded-2xl transition-all cursor-pointer shadow-xs flex items-center gap-2"
            >
              <StickyNote className="w-4 h-4" />
              <span>+ Quick Posted Sticky</span>
            </button>
            <button
              onClick={() => { setNewNoteType('document'); setShowNewModal(true); }}
              className="px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 active:scale-95 text-white font-bold text-xs rounded-2xl transition-all cursor-pointer shadow-md shadow-orange-500/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Notion Doc</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Notes', value: notes.length, icon: FileText, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/60' },
          { label: 'Starred & Pinned', value: notes.filter(n => n.isStarred || n.isPinned).length, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/60' },
          { label: 'Posted Stickies', value: notes.filter(n => n.type === 'posted').length, icon: StickyNote, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/60' },
          { label: 'AI Action Items', value: notes.reduce((a, n) => a + (n.actionItems?.length || 0), 0), icon: CheckSquare, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/60' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-orange-300 dark:hover:border-orange-900/50 transition-all flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center shrink-0 shadow-xs`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white leading-none">{value}</p>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-1.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Navigation Toolbar: Search, Filters, & View Mode ── */}
      <div className="space-y-3">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between min-w-0 overflow-hidden">
          <div className="flex-1 min-w-0 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search notes by title, tag, or content snippet..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs font-medium outline-none border border-slate-200/80 dark:border-slate-700/80 focus:border-orange-500 focus:bg-white dark:focus:bg-slate-950 transition-all text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 justify-between md:justify-end min-w-0 overflow-x-auto scrollbar-none pb-0.5">
            {/* Scope Filter: All vs Team Shared vs Private */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setScopeFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  scopeFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Scope
              </button>
              <button
                type="button"
                onClick={() => setScopeFilter('shared')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  scopeFilter === 'shared'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>🌐 Shared</span>
              </button>
              <button
                type="button"
                onClick={() => setScopeFilter('private')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  scopeFilter === 'private'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>🔒 Private</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowStarredOnly(!showStarredOnly)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border shrink-0 whitespace-nowrap ${
                showStarredOnly
                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${showStarredOnly ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
              <span>Starred</span>
            </button>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  viewMode === 'grid' ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-2xs font-extrabold' : 'text-slate-500'
                }`}
                title="Notion Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Notion Grid</span>
                <span className="sm:hidden">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('posted')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  viewMode === 'posted' ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-2xs font-extrabold' : 'text-slate-500'
                }`}
                title="Posted Board View"
              >
                <StickyNote className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Posted Board</span>
                <span className="sm:hidden">Board</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  viewMode === 'table' ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-2xs font-extrabold' : 'text-slate-500'
                }`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5 shrink-0" />
                <span>Table</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedType === 'all'
                ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            All Notes ({notes.length})
          </button>
          {NOTE_TYPES.map(t => {
            const count = notes.filter(n => n.type === t.id).length;
            const isActive = selectedType === t.id;
            const Icon = t.icon;

            return (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.name}</span>
                <span className={`px-2 py-0.5 text-[10px] rounded-full font-mono font-extrabold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Notes Grid / Canvas / Table ── */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Knowledge Base...</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 bg-orange-50 dark:bg-orange-950/50 rounded-2xl flex items-center justify-center mx-auto text-orange-500 border border-orange-200/60">
            <FileText className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">No Notes Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              Create your first Notion document or quick Posted sticky note to begin organizing your team knowledge.
            </p>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 active:scale-95 text-white font-bold text-xs rounded-2xl transition-all cursor-pointer shadow-md shadow-orange-500/20 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Note</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* ── Structured Table View ── */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
              <tr>
                <th className="px-5 py-3">Document Title</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Action Items</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredNotes.map(n => {
                const tc = getType(n.type);
                return (
                  <tr
                    key={n.id}
                    onClick={() => setSelectedNote(n)}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer font-medium text-slate-800 dark:text-slate-200"
                  >
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">{n.title}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {tc.name}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">{n.date.toLocaleDateString()}</td>
                    <td className="px-5 py-3.5">
                      {n.actionItems && n.actionItems.length > 0 ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          {n.actionItems.length} items
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={e => { e.stopPropagation(); handleToggleStar(n.id); }}
                        className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        <Star className={`w-3.5 h-3.5 ${n.isStarred ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* ── Grid / Posted View ── */
        <div className="space-y-6">
          {pinnedNotes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Pin className="w-4 h-4 text-indigo-500 fill-indigo-500" />
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pinned Knowledge Docs</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pinnedNotes.map(n => <NoteCard key={n.id} note={n} />)}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {pinnedNotes.length > 0 && (
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">All Workspace Notes</h2>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {regularNotes.map(n => <NoteCard key={n.id} note={n} />)}
            </div>
          </div>
        </div>
      )}

      {/* ── Persistent Floating Scratchpad Widget (Notepad Drawer) ── */}
      <div className="fixed bottom-6 right-6 z-40">
        {scratchpadOpen ? (
          <div className="w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold">Quick Scratchpad Notepad</span>
              </div>
              <button
                onClick={() => setScratchpadOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3">
              <textarea
                placeholder="Jot down quick thoughts, call notes, or code snippets..."
                value={scratchpadText}
                onChange={e => setScratchpadText(e.target.value)}
                rows={5}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none resize-none text-slate-900 dark:text-white placeholder:text-slate-400 font-mono"
              />
            </div>
            <div className="px-3 pb-3 flex items-center justify-between text-[10px] text-slate-400">
              <span>Auto-saved to session</span>
              <button
                onClick={() => {
                  setNewTitle('Scratchpad Note');
                  setNewContent(scratchpadText);
                  setShowNewModal(true);
                }}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                Convert to Note &rarr;
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setScratchpadOpen(true)}
            className="p-3.5 bg-slate-900 text-white rounded-full shadow-lg hover:bg-indigo-600 transition-all cursor-pointer flex items-center gap-2 border border-slate-800"
          >
            <PenTool className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold hidden sm:inline">Quick Scratchpad</span>
          </button>
        )}
      </div>

      {/* ── Create Note Modal ── */}
      {showNewModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 pb-24 sm:pb-4 md:p-6 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs" onClick={() => setShowNewModal(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-7.5rem)] sm:max-h-[85vh] transform animate-in slide-in-from-bottom-4 duration-300">
            {/* Modal Header */}
            <div className="shrink-0 px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-orange-500 text-white rounded-xl shadow-xs">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Create New Knowledge Note</h3>
              </div>
              <button 
                onClick={() => setShowNewModal(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar">
              {/* Type Selection */}
              <div>
                <label className={labelCls}>Note Type</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {NOTE_TYPES.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNewNoteType(t.id as any)}
                      className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        newNoteType === t.id
                          ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <span>{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color picker if Posted */}
              {newNoteType === 'posted' && (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 rounded-2xl space-y-2">
                  <label className={labelCls}>Posted Sticky Color</label>
                  <div className="flex items-center gap-3">
                    {STICKY_COLORS.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setNewStickyColor(c.id)}
                        className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${c.badge} ${
                          newStickyColor === c.id ? 'scale-110 border-orange-500 ring-2 ring-orange-500/40 shadow-sm' : 'border-transparent hover:scale-105'
                        }`}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Access & Visibility Selection */}
              <div>
                <label className={labelCls}>Access & Visibility</label>
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setNewIsPrivate(false)}
                    className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 text-center ${
                      !newIsPrivate
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-500 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-extrabold text-indigo-600 dark:text-indigo-400">
                      <Users className="w-4 h-4" /> 🌐 Team Shared
                    </span>
                    <span className="text-[10px] font-medium opacity-80">Visible & reviewable by workspace team</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewIsPrivate(true)}
                    className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 text-center ${
                      newIsPrivate
                        ? 'bg-amber-50/80 dark:bg-amber-950/60 border-amber-500 text-amber-950 dark:text-amber-200 ring-2 ring-amber-500/20'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-extrabold text-amber-600 dark:text-amber-400">
                      <Star className="w-4 h-4" /> 🔒 Private Note
                    </span>
                    <span className="text-[10px] font-medium opacity-80">Only you can view and edit</span>
                  </button>
                </div>
              </div>

              <div>
                <label className={labelCls}>Title</label>
                <input
                  type="text"
                  placeholder="Document or Sticky Headline..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-medium outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-950 transition-all text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className={labelCls}>Content</label>
                <textarea
                  placeholder="Write your document notes, action points, or brain dumps..."
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-medium outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-950 transition-all text-slate-900 dark:text-white resize-none leading-relaxed min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="strategy, launch, Q4..."
                    value={newTags}
                    onChange={e => setNewTags(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-medium outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-950 transition-all text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className={labelCls}>Assigned Team Member</label>
                  <select
                    value={assignedMember}
                    onChange={e => setAssignedMember(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none focus:border-orange-500 transition-all text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="">Unassigned</option>
                    {teamMembers.map(m => (
                      <option key={m.userId} value={m.userId}>{m.firstName} {m.lastName} ({m.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* AI Copilot Assist Container */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-orange-50/70 via-white to-amber-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-850 border border-orange-200/80 dark:border-slate-800 rounded-2xl">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showAIAssist}
                    onChange={e => setShowAIAssist(e.target.checked)}
                    className="w-4 h-4 accent-orange-500 cursor-pointer rounded"
                  />
                  <span className="text-xs font-extrabold text-orange-900 dark:text-orange-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-orange-500 shrink-0" /> AI Assist (summary & action items)
                  </span>
                </label>
                {showAIAssist && (
                  <select
                    value={selectedEngine}
                    onChange={e => setSelectedEngine(e.target.value as 'deep' | 'fast')}
                    className="text-xs font-bold px-3 py-1.5 bg-white dark:bg-slate-900 border border-orange-200 dark:border-orange-800 rounded-xl cursor-pointer text-orange-900 dark:text-orange-300 shadow-2xs"
                  >
                    {availableEngines.map(e => (
                      <option key={e.id} value={e.id} title={e.description}>{e.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {assistError && (
                <div className="px-4 py-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-2xl text-[11px] font-bold text-amber-800 dark:text-amber-300">
                  {assistError}
                </div>
              )}
            </div>

            {/* Modal Footer - Guaranteed Sticky, Elevated & Always Visible */}
            <div className="shrink-0 px-4 sm:px-6 py-3.5 sm:py-4 border-t-2 border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-3 shadow-xl z-20">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="flex-1 sm:flex-initial sm:min-w-[110px] py-3 px-4 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl text-xs font-black transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={creatingNote || !newTitle.trim()}
                className="flex-2 sm:flex-initial sm:min-w-[160px] py-3 px-6 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-40 text-white font-black text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 active:scale-95 text-center"
              >
                {creatingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>Save Note</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View & Collaborative Edit Note Drawer Modal ── */}
      {selectedNote && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 pb-24 sm:pb-4 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs" onClick={() => setSelectedNote(null)} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-7.5rem)] sm:max-h-[85vh]">
            <div className="shrink-0 px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                  selectedNote.isPrivate
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/60'
                    : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/60'
                }`}>
                  {selectedNote.isPrivate ? '🔒 Private' : '🌐 Team Shared'}
                </span>
                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-950/60 px-2 py-0.5 rounded-md uppercase">
                  {selectedNote.type}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsEditingSelected(!isEditingSelected)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    isEditingSelected
                      ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isEditingSelected ? 'Cancel Edit' : '✏️ Edit / Review'}
                </button>
                <button
                  onClick={() => handleToggleStar(selectedNote.id)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  <Star className={`w-4 h-4 ${selectedNote.isStarred ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
                </button>
                <button
                  onClick={() => handleTogglePin(selectedNote.id)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  <Pin className={`w-4 h-4 ${selectedNote.isPinned ? 'fill-indigo-500 text-indigo-500' : 'text-slate-400'}`} />
                </button>
                <button onClick={() => setSelectedNote(null)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Author and Timestamp Header Strip */}
            <div className="px-5 sm:px-6 py-2.5 bg-slate-50/90 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-700 dark:text-slate-200">Created by:</span>
                <span className="font-semibold text-orange-600 dark:text-orange-400">{selectedNote.authorName || 'Team Member'}</span>
                <span className="text-slate-400">•</span>
                <span>{selectedNote.date.toLocaleDateString()} at {selectedNote.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              {selectedNote.lastEditedBy && (
                <div className="text-[11px] italic text-slate-400 hidden sm:block">
                  Updated by {selectedNote.lastEditedBy}
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              {isEditingSelected ? (
                /* Collaborative Edit Form */
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Note Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-medium outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Note Content</label>
                    <textarea
                      rows={6}
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-medium outline-none focus:border-orange-500 text-slate-900 dark:text-white resize-none leading-relaxed"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Visibility:</span>
                    <button
                      type="button"
                      onClick={() => setEditIsPrivate(!editIsPrivate)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        editIsPrivate
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                          : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200'
                      }`}
                    >
                      {editIsPrivate ? '🔒 Private (Only Me)' : '🌐 Team Shared'}
                    </button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
                    {selectedNote.title}
                  </h2>

                  <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-medium">
                    {selectedNote.content || 'No content written yet.'}
                  </div>

                  {selectedNote.aiSummary && (
                    <div className="p-4 bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/40 rounded-2xl space-y-1">
                      <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-bold text-xs">
                        <Sparkles className="w-4 h-4" />
                        <span>Okleevo Neural Copilot Summary</span>
                      </div>
                      <p className="text-xs text-purple-900 dark:text-purple-200 leading-relaxed font-medium">
                        {selectedNote.aiSummary}
                      </p>
                    </div>
                  )}

                  {selectedNote.actionItems && selectedNote.actionItems.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Action Items</h4>
                      <div className="space-y-1.5">
                        {selectedNote.actionItems.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                            <CheckSquare className="w-4 h-4 shrink-0 text-emerald-600" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="shrink-0 p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex flex-wrap items-center justify-between gap-2.5">
              <button
                onClick={() => { handleDelete(selectedNote.id); setSelectedNote(null); }}
                className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Note</span>
              </button>

              <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
                {isEditingSelected ? (
                  <button
                    onClick={handleSaveEdit}
                    disabled={savingEdit || !editTitle.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-orange-500/20"
                  >
                    {savingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>Save Changes</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleCopy(selectedNote)}
                      className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={exportToTasks}
                      className="px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Export to Task</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
