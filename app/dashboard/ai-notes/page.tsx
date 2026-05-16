"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  FileText, Plus, Search, Star, Pin,
  Calendar, Users, Sparkles, Download,
  CheckSquare, LayoutGrid, List, TrendingUp,
  Lightbulb, X, ChevronRight, Copy,
  Mic, Video, BookOpen, Trash2, Loader2
} from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  type: 'meeting' | 'brainstorm' | 'document' | 'task' | 'research' | 'personal';
  date: Date;
  tags: string[];
  isPinned: boolean;
  isStarred: boolean;
  aiSummary?: string;
  actionItems?: string[];
  participants?: string[];
  duration?: string;
}

interface AIModel {
  id: string;
  name: string;
  provider: 'Groq' | 'Gemini';
  description: string;
}

const availableModels: AIModel[] = [
  { id: 'mistral-saba-24b',              name: 'Mistral Saba',     provider: 'Groq',   description: 'Fast, efficient 24B parameter model' },
  { id: 'gemma2-9b-it',                  name: 'Gemma 2',          provider: 'Groq',   description: "Google's lightweight instruction-tuned model" },
  { id: 'qwen-qwq-32b',                  name: 'Qwen QwQ',         provider: 'Groq',   description: 'Advanced model from Alibaba Cloud' },
  { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1',      provider: 'Groq',   description: 'Reasoning-focused model' },
  { id: 'gemini-1.5-pro',                name: 'Gemini 1.5 Pro',   provider: 'Gemini', description: "Google's most capable multimodal model" },
  { id: 'gemini-1.5-flash',              name: 'Gemini 1.5 Flash', provider: 'Gemini', description: 'Fast and cost-efficient multimodal model' },
];

const NOTE_TYPES = [
  { id: 'meeting',    name: 'Meeting',    icon: Users,       gradient: 'from-blue-500 to-cyan-500',     accent: 'bg-blue-50 text-blue-600 border-blue-100'   },
  { id: 'brainstorm', name: 'Brainstorm', icon: Lightbulb,   gradient: 'from-yellow-500 to-orange-500', accent: 'bg-amber-50 text-amber-600 border-amber-100' },
  { id: 'document',   name: 'Document',   icon: FileText,    gradient: 'from-purple-500 to-pink-500',   accent: 'bg-purple-50 text-purple-600 border-purple-100' },
  { id: 'task',       name: 'Tasks',      icon: CheckSquare, gradient: 'from-green-500 to-emerald-500', accent: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  { id: 'research',   name: 'Research',   icon: BookOpen,    gradient: 'from-indigo-500 to-purple-500', accent: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
  { id: 'personal',   name: 'Personal',   icon: Star,        gradient: 'from-pink-500 to-rose-500',     accent: 'bg-rose-50 text-rose-600 border-rose-100'   },
];

const getType = (id: string) => NOTE_TYPES.find(t => t.id === id) ?? NOTE_TYPES[0];

const inputCls = "w-full min-h-[44px] px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 focus:bg-white transition-all outline-none text-sm font-medium text-gray-900 placeholder:text-gray-400";

export default function AINotesPage() {
  const [notes, setNotes]                   = useState<Note[]>([]);
  const [loading, setLoading]               = useState(true);
  const [viewMode, setViewMode]             = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery]       = useState('');
  const [selectedType, setSelectedType]     = useState('all');
  const [showNewModal, setShowNewModal]     = useState(false);
  const [selectedNote, setSelectedNote]     = useState<Note | null>(null);
  const [showAIAssist, setShowAIAssist]     = useState(false);
  const [newNoteType, setNewNoteType]       = useState('meeting');
  const [selectedModel, setSelectedModel]   = useState<AIModel>(availableModels[0]);
  const [copied, setCopied]                 = useState(false);
  const [newTitle, setNewTitle]             = useState('');
  const [newContent, setNewContent]         = useState('');
  const [newTags, setNewTags]               = useState('');

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

  const filteredNotes = notes.filter(n => {
    const q = searchQuery.toLowerCase();
    return (
      (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tags.some(t => t.toLowerCase().includes(q))) &&
      (selectedType === 'all' || n.type === selectedType)
    );
  });

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

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    const res = await fetch('/api/ai-notes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTitle.trim(), content: newContent.trim(), type: newNoteType,
        tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
        aiSummary: showAIAssist ? `AI summary for ${newTitle}` : null,
        actionItems: showAIAssist ? ['Action item 1', 'Action item 2'] : [],
      }),
    });
    if (res.ok) {
      const c: Omit<Note, 'date'> & { date: string } = await res.json();
      setNotes(prev => [{ ...c, date: new Date(c.date) }, ...prev]);
      setShowNewModal(false);
      setNewTitle(''); setNewContent(''); setNewTags(''); setShowAIAssist(false);
    }
  };

  const handleCopy = (note: Note) => {
    navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (note: Note) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([`${note.title}\n\n${note.content}`], { type: 'text/plain' }));
    a.download = `${note.title}-${Date.now()}.txt`;
    a.click();
  };

  /* ── Card ─────────────────────────────────────────────────────────── */
  const NoteCard = ({ note, index }: { note: Note; index: number }) => {
    const tc = getType(note.type);
    const Icon = tc.icon;

    if (viewMode === 'list') return (
      <div
        onClick={() => setSelectedNote(note)}
        className="group bg-white rounded-2xl border border-gray-100 px-4 py-3 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer flex items-center gap-3 shadow-sm"
      >
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${tc.gradient} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-gray-900 truncate group-hover:text-indigo-700 transition-colors">{note.title}</p>
          <p className="text-xs text-gray-400 truncate mt-0.5 font-medium">{note.content}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:block text-[10px] text-gray-400 font-medium">{note.date.toLocaleDateString()}</span>
          <button
            onClick={e => { e.stopPropagation(); handleToggleStar(note.id); }}
            className="p-1.5 hover:bg-yellow-50 rounded-lg transition-all cursor-pointer"
          >
            <Star className={`w-4 h-4 ${note.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
          </button>
        </div>
      </div>
    );

    return (
      <div
        onClick={() => setSelectedNote(note)}
        className="group relative bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-5 hover:border-indigo-200 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden flex flex-col shadow-sm active:scale-[0.98]"
        style={{ animationDelay: `${index * 40}ms` }}
      >
        {/* Top row */}
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tc.gradient} flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shrink-0`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center gap-1">
            {note.isPinned && <Pin className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />}
            <button
              onClick={e => { e.stopPropagation(); handleToggleStar(note.id); }}
              className="p-1.5 hover:bg-yellow-50 rounded-lg transition-all cursor-pointer"
            >
              <Star className={`w-4 h-4 ${note.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
            </button>
          </div>
        </div>

        {/* Title + content */}
        <h3 className="text-sm sm:text-base font-black text-gray-900 mb-1.5 group-hover:text-indigo-700 transition-colors leading-snug line-clamp-2">
          {note.title}
        </h3>
        <p className="text-xs text-gray-400 font-medium leading-relaxed line-clamp-3 flex-1 mb-3">
          {note.content || 'No content yet.'}
        </p>

        {/* AI summary chip */}
        {note.aiSummary && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-50 rounded-xl border border-purple-100 mb-3">
            <Sparkles className="w-3 h-3 text-purple-500 shrink-0" />
            <p className="text-[10px] font-bold text-purple-700 line-clamp-1">{note.aiSummary}</p>
          </div>
        )}

        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap mb-3">
            {note.tags.slice(0, 2).map((tag, i) => (
              <span key={i} className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded-md text-[9px] font-black uppercase tracking-wider border border-slate-100">#{tag}</span>
            ))}
            {note.tags.length > 2 && <span className="px-2 py-0.5 bg-slate-50 text-slate-400 rounded-md text-[9px] font-black border border-slate-100">+{note.tags.length - 2}</span>}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
          <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
            <Calendar className="w-3 h-3" />
            {note.date.toLocaleDateString()}
          </div>
          {note.actionItems && note.actionItems.length > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-lg border border-emerald-100">
              <CheckSquare className="w-3 h-3" />{note.actionItems.length}
            </span>
          )}
        </div>
      </div>
    );
  };

  /* ── Main render ─────────────────────────────────────────────────── */
  return (
    <div className="relative min-h-screen -m-4 sm:-m-6 p-4 sm:p-6 bg-slate-50">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] bg-indigo-500/8 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-purple-500/8 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-4 pb-24 sm:pb-10">

        {/* ── Hero header ── */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-5 sm:p-8 shadow-xl shadow-indigo-500/5">
          <div className="flex items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full mb-1.5">
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">AI Intelligence</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight leading-none">
                  Notes <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Studio</span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1 hidden sm:block">
                  Smart note-taking with AI summaries and action items.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowNewModal(true)}
              className="shrink-0 flex items-center gap-2 px-4 py-3 sm:px-6 sm:py-3.5 bg-gray-900 text-white font-black text-[11px] sm:text-xs uppercase tracking-widest rounded-xl sm:rounded-2xl hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/30 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Note</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {[
            { icon: FileText,    label: 'Notes',   value: notes.length,                                                                                       color: 'text-blue-600',    bg: 'bg-blue-50'    },
            { icon: Star,        label: 'Starred',  value: notes.filter(n => n.isStarred).length,                                                             color: 'text-amber-600',   bg: 'bg-amber-50'   },
            { icon: TrendingUp,  label: 'Week',     value: notes.filter(n => { const w = new Date(); w.setDate(w.getDate()-7); return n.date >= w; }).length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { icon: CheckSquare, label: 'Actions',  value: notes.reduce((a, n) => a + (n.actionItems?.length || 0), 0),                                       color: 'text-purple-600',  bg: 'bg-purple-50'  },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className={`w-8 h-8 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div>
                <div className="text-lg sm:text-xl font-black text-gray-900 leading-none">{value}</div>
                <div className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Search + view toggle ── */}
        <div className="flex gap-2 sm:gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text" placeholder="Search notes…" value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 rounded-xl sm:rounded-2xl transition-all font-medium text-gray-900 placeholder:text-gray-300 shadow-sm focus:outline-none text-sm"
            />
          </div>
          <div className="flex items-center gap-0.5 bg-white border border-gray-200 shadow-sm rounded-xl p-1">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode==='grid' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-50'}`}><LayoutGrid className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode==='list' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-50'}`}><List className="w-4 h-4" /></button>
          </div>
        </div>

        {/* ── Type filter pills ── */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedType('all')}
            className={`shrink-0 px-4 py-2 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all cursor-pointer border ${selectedType === 'all' ? 'bg-gray-900 text-white border-gray-900 shadow-lg' : 'bg-white text-gray-500 border-gray-100 hover:border-indigo-200 hover:text-indigo-600'}`}
          >
            All
          </button>
          {NOTE_TYPES.map(t => {
            const Icon = t.icon;
            const active = selectedType === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all cursor-pointer border ${active ? 'bg-gray-900 text-white border-gray-900 shadow-lg' : 'bg-white text-gray-500 border-gray-100 hover:border-indigo-200 hover:text-indigo-600'}`}
              >
                <Icon className="w-3 h-3" />
                {t.name}
              </button>
            );
          })}
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-gray-400 font-black uppercase text-xs tracking-widest">Loading notes…</p>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && filteredNotes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-5 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center">
              <FileText className="w-8 h-8 text-indigo-300" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black text-gray-900">No notes found</h3>
              <p className="text-sm text-gray-400 font-medium">{searchQuery ? 'Try adjusting your search' : 'Create your first note to get started'}</p>
            </div>
            <button
              onClick={() => setShowNewModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-indigo-600 transition-all cursor-pointer shadow-lg"
            >
              <Plus className="w-4 h-4" />New Note
            </button>
          </div>
        )}

        {/* ── Pinned notes ── */}
        {pinnedNotes.length > 0 && !loading && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Pin className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500" />
              <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Pinned</h2>
            </div>
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3' : 'space-y-2'}>
              {pinnedNotes.map((n, i) => <NoteCard key={n.id} note={n} index={i} />)}
            </div>
          </div>
        )}

        {/* ── All notes ── */}
        {regularNotes.length > 0 && !loading && (
          <div className="space-y-3">
            {pinnedNotes.length > 0 && (
              <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">All Notes</h2>
            )}
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3' : 'space-y-2'}>
              {regularNotes.map((n, i) => <NoteCard key={n.id} note={n} index={i} />)}
            </div>
          </div>
        )}
      </div>

      {/* ══ Create Note Modal ══════════════════════════════════════════ */}
      {showNewModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowNewModal(false)} />
          <div
            className="relative z-10 w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col"
            style={{ maxHeight: '90dvh' }}
          >
            {/* Drag handle (mobile) */}
            <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            {/* Modal header */}
            <div className="shrink-0 flex items-center justify-between px-5 py-6 border-b border-gray-100">
              <div>
                <h3 className="text-2xl font-black text-gray-900 leading-none">
                  New <span className="text-indigo-600">Note</span>
                </h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">FILL IN THE DETAILS BELOW</p>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-gray-600 transition-all cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Note type pills */}
              <div className="space-y-4">
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {NOTE_TYPES.map(t => {
                    const Icon = t.icon;
                    const sel = newNoteType === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setNewNoteType(t.id)}
                        className={`shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${sel ? 'bg-[#5145fa] text-white shadow-lg' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                      >
                        <Icon className="w-4 h-4" />
                        {t.name.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
                {/* Visual scrollbar matching the image */}
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-[#94a3b8] rounded-full" />
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">TITLE</label>
                <input
                  type="text" placeholder="Give your note a clear title"
                  value={newTitle} onChange={e => setNewTitle(e.target.value)}
                  className={inputCls}
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">CONTENT</label>
                <textarea
                  placeholder="Write your notes here…" rows={5}
                  value={newContent} onChange={e => setNewContent(e.target.value)}
                  className={`${inputCls} resize-none min-h-[120px]`}
                />
              </div>

              {/* Tags + Model */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">TAGS</label>
                  <input
                    type="text" placeholder="strategy, Q4…"
                    value={newTags} onChange={e => setNewTags(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">AI MODEL</label>
                  <select
                    value={selectedModel.id}
                    onChange={e => { const m = availableModels.find(m => m.id === e.target.value); if (m) setSelectedModel(m); }}
                    className={`${inputCls} cursor-pointer appearance-none bg-slate-50`}
                  >
                    {availableModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              </div>

              {/* AI assist + Media */}
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center justify-between px-5 py-4 bg-[#f8faff] border border-blue-50 rounded-[2rem] shadow-sm">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#5145fa]" />
                    <span className="text-[11px] font-black text-[#1e1b4b] uppercase tracking-widest">AI ASSIST</span>
                  </div>
                  <div className="px-4 py-2 bg-white border border-gray-100 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest shadow-sm">
                    {showAIAssist ? 'ON' : 'OFF'}
                  </div>
                </div>
                <button className="w-14 h-14 flex items-center justify-center bg-white border border-gray-50 rounded-[1.5rem] text-gray-400 shadow-sm hover:bg-gray-50 transition-all cursor-pointer">
                  <Mic className="w-6 h-6" />
                </button>
                <button className="w-14 h-14 flex items-center justify-center bg-white border border-gray-50 rounded-[1.5rem] text-gray-400 shadow-sm hover:bg-gray-50 transition-all cursor-pointer">
                  <Video className="w-6 h-6" />
                </button>
              </div>
              {/* Action Buttons moved inside scrollable body with extended scroll space */}
              <div className="flex gap-3 pt-6 border-t border-gray-50 pb-32 sm:pb-12">
                <button
                  onClick={() => setShowNewModal(false)}
                  className="px-6 py-2.5 border border-gray-200 rounded-2xl text-sm font-black text-gray-500 hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newTitle.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#94a3b8] text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-600 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-lg active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  CREATE NOTE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ View Note Modal ════════════════════════════════════════════ */}
      {selectedNote && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setSelectedNote(null)} />
          <div
            className="relative z-10 w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col"
            style={{ maxHeight: '90dvh' }}
          >
            {/* Drag handle */}
            <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            {/* Note modal header */}
            <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100">
              {(() => {
                const tc = getType(selectedNote.type);
                const Icon = tc.icon;
                return (
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tc.gradient} flex items-center justify-center shadow-md`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{tc.name}</p>
                      <p className="text-xs font-bold text-indigo-600 mt-0.5">{selectedNote.date.toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })()}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleStar(selectedNote.id)}
                  className="p-2 hover:bg-yellow-50 rounded-xl transition-all cursor-pointer"
                >
                  <Star className={`w-4 h-4 ${selectedNote.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                </button>
                <button
                  onClick={() => handleTogglePin(selectedNote.id)}
                  className="p-2 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer"
                >
                  <Pin className={`w-4 h-4 ${selectedNote.isPinned ? 'fill-indigo-500 text-indigo-500' : 'text-gray-400'}`} />
                </button>
                <button
                  onClick={() => setSelectedNote(null)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-all cursor-pointer text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Note modal body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <h2 className="text-xl font-black text-gray-900 leading-tight">{selectedNote.title}</h2>

              {selectedNote.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedNote.tags.map((tag, i) => (
                    <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100">#{tag}</span>
                  ))}
                </div>
              )}

              {selectedNote.aiSummary && (
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                    <span className="text-[9px] font-black text-purple-200 uppercase tracking-widest">AI Summary</span>
                  </div>
                  <p className="text-sm font-medium leading-relaxed opacity-95">{selectedNote.aiSummary}</p>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 bg-indigo-500 rounded-full" />
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Notes</p>
                </div>
                <p className="text-sm font-medium text-gray-700 leading-relaxed border-l-2 border-gray-100 pl-4 py-1">
                  {selectedNote.content || 'No content yet.'}
                </p>
              </div>

              {selectedNote.actionItems && selectedNote.actionItems.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Action Items</p>
                  </div>
                  <div className="space-y-2">
                    {selectedNote.actionItems.map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-xs font-bold text-emerald-800">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedNote.participants && selectedNote.participants.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-blue-500 rounded-full" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Participants</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedNote.participants.map((p, i) => (
                      <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold border border-blue-100">{p}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Note modal footer */}
            <div className="shrink-0 px-4 py-3 border-t border-gray-100 bg-white space-y-2 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:pb-3 rounded-b-3xl">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleCopy(selectedNote)}
                  className="flex items-center justify-center gap-1.5 py-3 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all cursor-pointer"
                >
                  {copied ? <span className="text-emerald-600 font-black">Copied!</span> : <><Copy className="w-4 h-4" />Copy</>}
                </button>
                <button
                  onClick={() => handleDownload(selectedNote)}
                  className="flex items-center justify-center gap-1.5 py-3 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />Save
                </button>
                <button
                  onClick={() => { handleDelete(selectedNote.id); setSelectedNote(null); }}
                  className="flex items-center justify-center gap-1.5 py-3 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />Delete
                </button>
              </div>
              <button
                onClick={() => setSelectedNote(null)}
                className="w-full py-3 bg-gray-900 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
