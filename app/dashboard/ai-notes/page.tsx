"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  FileText, Plus, Search, Star, Edit3,
  Calendar, Clock, Users, Brain,
  Sparkles, Download, Share2, Pin,
  CheckSquare, List, Grid, TrendingUp,
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
  { id: 'mistral-saba-24b', name: 'Mistral Saba', provider: 'Groq', description: 'Fast, efficient 24B parameter model' },
  { id: 'gemma2-9b-it', name: 'Gemma 2', provider: 'Groq', description: 'Google\'s lightweight instruction-tuned model' },
  { id: 'qwen-qwq-32b', name: 'Qwen QwQ', provider: 'Groq', description: 'Advanced model from Alibaba Cloud' },
  { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1', provider: 'Groq', description: 'Reasoning-focused model' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Gemini', description: 'Google\'s most capable multimodal model' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Gemini', description: 'Fast and cost-efficient multimodal model' },
];

const noteTypes = [
  { id: 'meeting', name: 'Meeting Notes', icon: Users, color: 'from-blue-500 to-cyan-500', description: 'Capture meeting discussions and decisions' },
  { id: 'brainstorm', name: 'Brainstorm', icon: Lightbulb, color: 'from-yellow-500 to-orange-500', description: 'Creative ideas and innovation sessions' },
  { id: 'document', name: 'Document', icon: FileText, color: 'from-purple-500 to-pink-500', description: 'Formal documents and reports' },
  { id: 'task', name: 'Task List', icon: CheckSquare, color: 'from-green-500 to-emerald-500', description: 'Action items and to-dos' },
  { id: 'research', name: 'Research', icon: BookOpen, color: 'from-indigo-500 to-purple-500', description: 'Research findings and analysis' },
  { id: 'personal', name: 'Personal', icon: Star, color: 'from-pink-500 to-rose-500', description: 'Personal notes and thoughts' },
];

export default function AINotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showAIAssist, setShowAIAssist] = useState(false);
  const [selectedNoteType, setSelectedNoteType] = useState<string>('meeting');
  const [selectedModel, setSelectedModel] = useState<AIModel>(availableModels[0]);
  const [copied, setCopied] = useState(false);

  // Create form state
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteTags, setNewNoteTags] = useState('');

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch('/api/ai-notes');
      if (res.ok) {
        const data: (Omit<Note, 'date'> & { date: string })[] = await res.json();
        setNotes(data.map((n) => ({ ...n, date: new Date(n.date) })));
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'all' || note.type === selectedType;
    return matchesSearch && matchesType;
  });

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const regularNotes = filteredNotes.filter(n => !n.isPinned);

  const getTypeConfig = (type: string) => noteTypes.find(t => t.id === type) || noteTypes[0];

  const handleDeleteNote = async (id: string) => {
    try {
      const res = await fetch(`/api/ai-notes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotes(notes.filter(n => n.id !== id));
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleToggleStar = async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    try {
      const res = await fetch(`/api/ai-notes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isStarred: !note.isStarred }),
      });
      if (res.ok) {
        const updated: Omit<Note, 'date'> & { date: string } = await res.json();
        setNotes(notes.map(n => n.id === id ? { ...updated, date: new Date(updated.date) } : n));
      }
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  const handleTogglePin = async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    try {
      const res = await fetch(`/api/ai-notes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !note.isPinned }),
      });
      if (res.ok) {
        const updated: Omit<Note, 'date'> & { date: string } = await res.json();
        setNotes(notes.map(n => n.id === id ? { ...updated, date: new Date(updated.date) } : n));
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const handleCreateNote = async () => {
    if (!newNoteTitle.trim()) return;
    try {
      const res = await fetch('/api/ai-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newNoteTitle.trim(),
          content: newNoteContent.trim(),
          type: selectedNoteType,
          tags: newNoteTags.split(',').map(t => t.trim()).filter(Boolean),
          aiSummary: showAIAssist ? `AI generated summary for ${newNoteTitle}` : null,
          actionItems: showAIAssist ? ['Action item 1', 'Action item 2'] : [],
        }),
      });
      if (res.ok) {
        const created: Omit<Note, 'date'> & { date: string } = await res.json();
        setNotes([{ ...created, date: new Date(created.date) }, ...notes]);
        setShowNewNoteModal(false);
        setNewNoteTitle('');
        setNewNoteContent('');
        setNewNoteTags('');
        setShowAIAssist(false);
      }
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleCopyNote = (note: Note) => {
    navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadNote = (note: Note) => {
    const blob = new Blob([`${note.title}\n\n${note.content}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title}-${Date.now()}.txt`;
    a.click();
  };

  return (
    <div className="relative min-h-screen -m-4 md:-m-8 p-4 md:p-8 overflow-hidden bg-slate-50">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-pink-600/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 space-y-6 pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/90 backdrop-blur-2xl p-8 rounded-3xl border-2 border-white shadow-2xl shadow-purple-500/5 items-start">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-widest border border-indigo-200">
              <Sparkles className="w-3 h-3" />
              AI Notes
            </div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tight flex items-center gap-4">
              Notes <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-purple-600">Studio</span>
            </h1>
            <p className="text-gray-500 font-medium max-w-2xl text-lg">
              Smart note-taking with AI summaries and action item extraction.
            </p>
          </div>
          <button
            onClick={() => setShowNewNoteModal(true)}
            className="px-8 py-5 bg-gray-900 text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-600 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-500 flex items-center gap-3 group cursor-pointer"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
            Create Note
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white px-8 py-6 rounded-3xl border-2 border-white shadow-xl shadow-indigo-500/5 group hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-blue-500/10 rounded-2xl group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-3xl font-black text-gray-900 leading-none">{notes.length}</div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">Total Notes</div>
              </div>
            </div>
          </div>

          <div className="bg-white px-8 py-6 rounded-3xl border-2 border-white shadow-xl shadow-purple-500/5 group hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-purple-500/10 rounded-2xl group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-3xl font-black text-gray-900 leading-none">{notes.filter(n => n.isStarred).length}</div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">Starred</div>
              </div>
            </div>
          </div>

          <div className="bg-white px-8 py-6 rounded-3xl border-2 border-white shadow-xl shadow-emerald-500/5 group hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-emerald-500/10 rounded-2xl group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-3xl font-black text-gray-900 leading-none">
                  {notes.filter(n => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return n.date >= weekAgo;
                  }).length}
                </div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">This Week</div>
              </div>
            </div>
          </div>

          <div className="bg-white px-8 py-6 rounded-3xl border-2 border-white shadow-xl shadow-amber-500/5 group hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-amber-500/10 rounded-2xl group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                <CheckSquare className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <div className="text-3xl font-black text-gray-900 leading-none">
                  {notes.reduce((acc, n) => acc + (n.actionItems?.length || 0), 0)}
                </div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">Action Items</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 relative group">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              placeholder="Search notes, tags, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-white border-2 border-transparent focus:border-indigo-500 rounded-4xl transition-all duration-300 font-bold text-gray-900 placeholder:text-gray-300 shadow-xl shadow-indigo-500/5 focus:bg-white focus:shadow-indigo-500/10"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="pl-6 pr-12 py-5 bg-white border-2 border-transparent focus:border-indigo-500 rounded-3xl transition-all duration-300 font-black text-gray-900 uppercase tracking-widest text-xs shadow-xl shadow-indigo-500/5 appearance-none cursor-pointer"
              >
                <option value="all">All Types</option>
                {noteTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
            </div>

            <div className="flex items-center gap-1 bg-white border-2 border-white shadow-xl shadow-indigo-500/5 rounded-2xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-all duration-300 cursor-pointer ${viewMode === 'grid' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-all duration-300 cursor-pointer ${viewMode === 'list' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

      {/* Create Note Modal */}
      {showNewNoteModal && (
        <div className="fixed inset-0 lg:left-64 bg-gray-900/40 backdrop-blur-xl flex items-center justify-center z-[100] p-12 animate-in fade-in duration-300">
          <div className="bg-white/95 backdrop-blur-3xl rounded-[2.5rem] max-w-5xl w-full max-h-[78vh] overflow-hidden border-2 border-white shadow-2xl flex flex-col md:flex-row shadow-indigo-500/20 animate-in zoom-in-95 duration-500">
            {/* Sidebar for Note Types */}
            <div className="w-full md:w-80 bg-gray-50/50 p-8 border-r border-gray-100 overflow-y-auto custom-scrollbar">
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Note Type</h2>
              <div className="space-y-3">
                {noteTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedNoteType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedNoteType(type.id)}
                      className={`w-full group relative bg-white rounded-2xl p-5 transition-all duration-300 text-left cursor-pointer border-2 ${
                        isSelected
                          ? 'border-indigo-500 shadow-xl shadow-indigo-500/10'
                          : 'border-transparent hover:bg-white hover:shadow-lg'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-linear-to-br ${type.color} shadow-lg transition-transform duration-500 ${isSelected ? 'scale-110 shadow-indigo-500/40' : 'group-hover:scale-110'}`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-black text-gray-900 text-[10px] uppercase tracking-widest">{type.name}</h3>
                          <p className="text-[9px] text-gray-400 font-bold mt-1 line-clamp-2 leading-relaxed">{type.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-white/50 backdrop-blur-sm">
              {/* Header */}
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">Create <span className="text-indigo-600">Note</span></h2>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Fill in the details below</p>
                </div>
                <button
                  onClick={() => setShowNewNoteModal(false)}
                  className="p-4 hover:bg-gray-100 rounded-2xl transition-all duration-300 group cursor-pointer"
                >
                  <X className="w-6 h-6 text-gray-400 group-hover:rotate-90 transition-transform duration-500" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
                <div className="space-y-6">
                  <div className="relative group">
                    <label className="absolute -top-3 left-6 px-2 bg-white text-[10px] font-black text-indigo-600 uppercase tracking-widest z-10 rounded-full border border-indigo-100">Note Title</label>
                    <input
                      type="text"
                      placeholder="Give your note a clear title"
                      value={newNoteTitle}
                      onChange={(e) => setNewNoteTitle(e.target.value)}
                      className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-3xl transition-all duration-300 font-bold text-gray-900 text-lg shadow-sm"
                    />
                  </div>

                  <div className="relative group">
                    <label className="absolute -top-3 left-6 px-2 bg-white text-[10px] font-black text-indigo-600 uppercase tracking-widest z-10 rounded-full border border-indigo-100">Content</label>
                    <textarea
                      placeholder="Write your notes here..."
                      rows={8}
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      className="w-full px-8 py-6 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-3xl transition-all duration-300 font-bold text-gray-900 shadow-sm resize-none leading-relaxed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="relative group">
                    <label className="absolute -top-3 left-6 px-2 bg-white text-[10px] font-black text-indigo-600 uppercase tracking-widest z-10 rounded-full border border-indigo-100">Tags</label>
                    <input
                      type="text"
                      placeholder="strategy, planning, Q4..."
                      value={newNoteTags}
                      onChange={(e) => setNewNoteTags(e.target.value)}
                      className="w-full px-8 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl transition-all duration-300 font-bold text-sm text-gray-900 shadow-sm"
                    />
                  </div>

                  <div className="relative group">
                    <label className="absolute -top-3 left-6 px-2 bg-white text-[10px] font-black text-indigo-600 uppercase tracking-widest z-10 rounded-full border border-indigo-100">AI Model</label>
                    <div className="relative">
                      <select
                        value={selectedModel.id}
                        onChange={(e) => {
                          const model = availableModels.find(m => m.id === e.target.value);
                          if (model) setSelectedModel(model);
                        }}
                        className="w-full px-8 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl transition-all duration-300 font-bold text-sm text-gray-900 shadow-sm appearance-none cursor-pointer"
                      >
                        {availableModels.map((model) => (
                          <option key={model.id} value={model.id}>
                            {model.name} — {model.provider}
                          </option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 p-6 bg-indigo-50/50 rounded-3xl border-2 border-indigo-100/50 relative overflow-hidden group/assist">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/assist:rotate-12 transition-transform duration-700">
                    <Brain className="w-16 h-16 text-indigo-600" />
                  </div>
                  <div className="p-4 bg-white rounded-2xl shadow-xl shadow-indigo-500/10">
                    <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
                  </div>
                  <div className="flex-1 relative z-10">
                    <h4 className="font-black text-gray-900 text-sm uppercase tracking-widest">AI Assistance</h4>
                    <p className="text-[10px] font-medium text-gray-500 mt-1 max-w-md">Automatically generate a summary and extract action items from your note.</p>
                  </div>
                  <button
                    onClick={() => setShowAIAssist(!showAIAssist)}
                    className={`px-6 py-3 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all duration-300 cursor-pointer ${
                      showAIAssist
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'
                        : 'bg-indigo-600 text-white hover:bg-gray-900 shadow-xl shadow-indigo-500/30'
                    }`}
                  >
                    {showAIAssist ? 'Enabled' : 'Enable'}
                  </button>
                </div>
              </div>

              <div className="p-8 border-t border-gray-100 flex items-center justify-between gap-6 bg-white/50 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <button className="p-4 bg-gray-50 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 rounded-2xl transition-all duration-300 cursor-pointer group" title="Voice input">
                    <Mic className="w-6 h-6 group-hover:scale-110" />
                  </button>
                  <button className="p-4 bg-gray-50 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 rounded-2xl transition-all duration-300 cursor-pointer group" title="Video">
                    <Video className="w-6 h-6 group-hover:scale-110" />
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowNewNoteModal(false)}
                    className="px-8 py-4 text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-100 transition-all duration-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateNote}
                    disabled={!newNoteTitle.trim()}
                    className="px-10 py-4 bg-gray-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-600 hover:shadow-2xl hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 cursor-pointer"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Note Modal */}
      {selectedNote && (
        <div className="fixed inset-0 lg:left-64 bg-gray-900/40 backdrop-blur-xl flex items-center justify-center z-[100] p-12 animate-in fade-in duration-300">
          <div className="bg-white/95 backdrop-blur-2xl rounded-[2.5rem] max-w-2xl w-full max-h-[78vh] overflow-y-auto border-2 border-white shadow-2xl flex flex-col shadow-indigo-500/20 animate-in zoom-in-95 duration-500 custom-scrollbar">

            {/* Header Row */}
            <div className="p-8 pb-4 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-20">
              {(() => {
                const NoteTypeIcon = getTypeConfig(selectedNote.type).icon;
                return (
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl bg-linear-to-br ${getTypeConfig(selectedNote.type).color} shadow-lg shadow-indigo-500/20`}>
                      <NoteTypeIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em]">{getTypeConfig(selectedNote.type).name}</h2>
                      <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-0.5">{selectedNote.date.toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })()}
              <button
                onClick={() => setSelectedNote(null)}
                className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all duration-300 group cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-400 group-hover:rotate-90 transition-transform duration-500" />
              </button>
            </div>

            <div className="px-8 space-y-8 pb-10">
              {/* Date & Tags */}
              <div className="grid grid-cols-2 gap-8 border-t border-gray-100 pt-8">
                <div className="space-y-3">
                  <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Date</h2>
                  <div className="flex items-center gap-3 text-xs font-bold text-gray-600 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    {selectedNote.date.toLocaleDateString()}
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {selectedNote.tags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100 shadow-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => handleCopyNote(selectedNote)}
                  className="flex-1 px-6 py-4 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-500 flex items-center justify-center gap-3 cursor-pointer group shadow-sm"
                >
                  {copied ? <span className="text-emerald-500 group-hover:text-white">Copied!</span> : (
                    <>
                      <Share2 className="w-4 h-4 group-hover:scale-110" />
                      Copy Note
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    handleDeleteNote(selectedNote.id);
                    setSelectedNote(null);
                  }}
                  className="flex-1 px-6 py-4 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-500 flex items-center justify-center gap-3 cursor-pointer group shadow-sm"
                >
                  <Trash2 className="w-4 h-4 group-hover:scale-110" />
                  Delete Note
                </button>
              </div>

              {/* Title */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">{selectedNote.title}</h2>
              </div>

              {/* AI Summary */}
              {selectedNote.aiSummary && (
                <div className="bg-linear-to-r from-indigo-700 via-purple-700 to-pink-700 rounded-4xl p-8 text-white relative overflow-hidden group shadow-2xl shadow-indigo-500/20">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-700">
                    <Brain className="w-24 h-24" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4 bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
                      <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                      <span className="text-[10px] font-black text-purple-100 uppercase tracking-widest leading-none">AI Summary</span>
                    </div>
                    <p className="text-lg font-bold leading-relaxed opacity-95">{selectedNote.aiSummary}</p>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Notes</h3>
                </div>
                <div className="prose prose-indigo max-w-none text-gray-600 font-bold leading-loose text-lg border-l-4 border-gray-100 pl-6">
                  {selectedNote.content}
                </div>
              </div>

              {/* Action Items */}
              {selectedNote.actionItems && selectedNote.actionItems.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Action Items</h3>
                  </div>
                  <div className="space-y-3">
                    {selectedNote.actionItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-5 bg-gray-50/80 rounded-2xl border border-gray-100 group/item hover:bg-emerald-50 hover:border-emerald-100 transition-all duration-300 cursor-pointer">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm group-hover/item:scale-110 group-hover/item:bg-emerald-500 group-hover/item:text-white transition-all">
                          <CheckSquare className="w-4 h-4 text-emerald-600 group-hover/item:text-white" />
                        </div>
                        <span className="text-sm font-black text-gray-700 leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Meeting Participants */}
              {selectedNote.participants && selectedNote.participants.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Participants</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {selectedNote.participants.map((p, idx) => (
                      <span key={idx} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold border border-blue-100">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t border-gray-100 flex items-center justify-between bg-white/50 sticky bottom-0 backdrop-blur-md z-20">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleCopyNote(selectedNote)}
                  className="p-4 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-indigo-600 rounded-2xl transition-all duration-300 cursor-pointer group shadow-sm"
                  title="Copy note"
                >
                  <Copy className="w-6 h-6 group-hover:scale-110" />
                </button>
                <button
                  onClick={() => handleDownloadNote(selectedNote)}
                  className="p-4 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-indigo-600 rounded-2xl transition-all duration-300 cursor-pointer group shadow-sm"
                  title="Download note"
                >
                  <Download className="w-6 h-6 group-hover:scale-110" />
                </button>
              </div>

              <button
                onClick={() => setSelectedNote(null)}
                className="px-10 py-5 bg-gray-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-600 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-500 flex items-center justify-center gap-3 cursor-pointer group"
              >
                <Edit3 className="w-5 h-5 group-hover:rotate-12" />
                Close
              </button>
            </div>
          </div>
        </div>
      )}

        {/* Loading State */}
        {loading && notes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-40 gap-6 animate-pulse">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center border-2 border-gray-100 shadow-xl">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
            <p className="text-gray-400 font-black uppercase text-xs tracking-[0.25em]">Synchronizing Studio Buffer...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredNotes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-40 gap-8 bg-white/50 backdrop-blur-xl rounded-[3rem] border-2 border-dashed border-gray-200">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">No notes detected</h3>
              <p className="text-gray-400 font-medium text-lg">Try adjusting your filters or create a new note.</p>
            </div>
            <button
              onClick={() => setShowNewNoteModal(true)}
              className="px-8 py-4 bg-gray-900 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-indigo-600 transition-all cursor-pointer shadow-lg hover:shadow-indigo-500/20"
            >
              Start New Entry
            </button>
          </div>
        )}

      {/* Pinned Notes */}
      {pinnedNotes.length > 0 && !loading && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Pin className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">Pinned Notes</h2>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pinnedNotes.map((note, index) => {
                const typeConfig = getTypeConfig(note.type);
                const Icon = typeConfig.icon;
                return (
                  <div
                    key={note.id}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div
                      className="group relative bg-white rounded-4xl border-2 border-gray-100 p-8 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col justify-between h-full shadow-sm"
                      onClick={() => setSelectedNote(note)}
                    >
                      <div className={`absolute inset-0 bg-linear-to-br ${typeConfig.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-6">
                          <div className={`p-4 rounded-2xl bg-linear-to-br ${typeConfig.color} shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleToggleStar(note.id); }}
                              className="p-3 bg-gray-50 hover:bg-yellow-100 rounded-xl transition-all duration-300 group/btn cursor-pointer"
                            >
                              <Star className={`w-5 h-5 ${note.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'} group-hover/btn:scale-110 transition-transform`} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleTogglePin(note.id); }}
                              className="p-3 bg-indigo-50 rounded-xl transition-all duration-300 group/btn cursor-pointer"
                            >
                              <Pin className="w-5 h-5 text-indigo-600 fill-indigo-600 group-hover/btn:scale-110 transition-transform" />
                            </button>
                          </div>
                        </div>

                        <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors tracking-tight leading-snug">
                          {note.title}
                        </h3>

                        <p className="text-sm font-medium text-gray-500 leading-relaxed mb-6 line-clamp-3">
                          {note.content}
                        </p>

                        {note.aiSummary && (
                          <div className="mb-6 p-4 bg-purple-50/50 rounded-2xl border border-purple-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-5">
                              <Brain className="w-12 h-12 text-purple-600" />
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="w-4 h-4 text-purple-600" />
                              <span className="text-[10px] font-black text-purple-900 uppercase tracking-widest">AI Summary</span>
                            </div>
                            <p className="text-xs font-bold text-purple-700/80 leading-relaxed line-clamp-2">
                              {note.aiSummary}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="relative z-10 flex flex-col gap-4">
                        <div className="flex flex-wrap gap-2">
                          {note.tags.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="px-3 py-1 bg-gray-50 text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-gray-100">
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                          <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5" />
                              {note.date.toLocaleDateString()}
                            </div>
                            {note.duration && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5" />
                                {note.duration}
                              </div>
                            )}
                          </div>
                          <div className="p-2 rounded-xl bg-gray-50 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {pinnedNotes.map((note) => {
                const typeConfig = getTypeConfig(note.type);
                const Icon = typeConfig.icon;
                return (
                  <div
                    key={note.id}
                    className="group bg-white rounded-2xl border-2 border-gray-100 p-6 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 cursor-pointer flex items-center gap-6 shadow-sm"
                    onClick={() => setSelectedNote(note)}
                  >
                    <div className={`p-4 rounded-xl bg-linear-to-br ${typeConfig.color} flex-shrink-0 group-hover:scale-110 transition-transform duration-500`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-black text-gray-900 mb-1 truncate group-hover:text-indigo-600 transition-colors">
                        {note.title}
                      </h3>
                      <p className="text-sm font-medium text-gray-500 truncate leading-relaxed">{note.content}</p>
                    </div>

                    <div className="flex items-center gap-6 flex-shrink-0">
                      {note.aiSummary && (
                        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg border border-purple-100">
                          <Sparkles className="w-3 h-3 text-purple-600" />
                          <span className="text-[10px] font-black text-purple-900 uppercase tracking-widest leading-none">AI Summary</span>
                        </div>
                      )}

                      {note.actionItems && note.actionItems.length > 0 && (
                        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 uppercase tracking-widest leading-none">
                          <CheckSquare className="w-3.5 h-3.5" />
                          {note.actionItems.length}
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none border border-gray-100 px-3 py-1.5 rounded-lg">
                        <Calendar className="w-3.5 h-3.5" />
                        {note.date.toLocaleDateString()}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleStar(note.id); }}
                          className="p-2.5 hover:bg-yellow-100 rounded-xl transition-all duration-300 cursor-pointer"
                        >
                          <Star className={`w-5 h-5 ${note.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleTogglePin(note.id); }}
                          className="p-2.5 hover:bg-indigo-100 rounded-xl transition-all duration-300 cursor-pointer"
                        >
                          <Pin className={`w-5 h-5 ${note.isPinned ? 'text-indigo-600 fill-indigo-600' : 'text-gray-300'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Regular Notes */}
      {regularNotes.length > 0 && !loading && (
        <div className="space-y-4">
          {pinnedNotes.length > 0 && (
            <h2 className="text-lg font-bold text-gray-900">All Notes</h2>
          )}

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularNotes.map((note, index) => {
                const typeConfig = getTypeConfig(note.type);
                const Icon = typeConfig.icon;
                return (
                  <div
                    key={note.id}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div
                      className="group relative bg-white rounded-4xl border-2 border-gray-100 p-8 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col justify-between h-full shadow-sm"
                      onClick={() => setSelectedNote(note)}
                    >
                      <div className={`absolute inset-0 bg-linear-to-br ${typeConfig.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-6">
                          <div className={`p-4 rounded-2xl bg-linear-to-br ${typeConfig.color} shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleToggleStar(note.id); }}
                              className="p-3 bg-gray-50 hover:bg-yellow-100 rounded-xl transition-all duration-300 group/btn cursor-pointer"
                            >
                              <Star className={`w-5 h-5 ${note.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'} group-hover/btn:scale-110 transition-transform`} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleTogglePin(note.id); }}
                              className="p-3 bg-gray-50 hover:bg-indigo-100 rounded-xl transition-all duration-300 group/btn cursor-pointer"
                            >
                              <Pin className={`w-5 h-5 ${note.isPinned ? 'text-indigo-600 fill-indigo-600' : 'text-gray-400'} group-hover/btn:scale-110 transition-transform`} />
                            </button>
                          </div>
                        </div>

                        <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors tracking-tight leading-snug">
                          {note.title}
                        </h3>

                        <p className="text-sm font-medium text-gray-500 leading-relaxed mb-6 line-clamp-3">
                          {note.content}
                        </p>

                        {note.aiSummary && (
                          <div className="mb-6 p-4 bg-purple-50/50 rounded-2xl border border-purple-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-5">
                              <Brain className="w-12 h-12 text-purple-600" />
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="w-4 h-4 text-purple-600" />
                              <span className="text-[10px] font-black text-purple-900 uppercase tracking-widest">AI Summary</span>
                            </div>
                            <p className="text-xs font-bold text-purple-700/80 leading-relaxed line-clamp-2">
                              {note.aiSummary}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="relative z-10 flex flex-col gap-4">
                        <div className="flex flex-wrap gap-2">
                          {note.tags.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="px-3 py-1 bg-gray-50 text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-gray-100">
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                          <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5" />
                              {note.date.toLocaleDateString()}
                            </div>
                            {note.duration && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5" />
                                {note.duration}
                              </div>
                            )}
                          </div>
                          <div className="p-2 rounded-xl bg-gray-50 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {regularNotes.map((note) => {
                const typeConfig = getTypeConfig(note.type);
                const Icon = typeConfig.icon;
                return (
                  <div
                    key={note.id}
                    className="group bg-white rounded-2xl border-2 border-gray-100 p-6 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 cursor-pointer flex items-center gap-6 shadow-sm"
                    onClick={() => setSelectedNote(note)}
                  >
                    <div className={`p-4 rounded-xl bg-linear-to-br ${typeConfig.color} flex-shrink-0 group-hover:scale-110 transition-transform duration-500`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-black text-gray-900 mb-1 truncate group-hover:text-indigo-600 transition-colors">
                        {note.title}
                      </h3>
                      <p className="text-sm font-medium text-gray-500 truncate leading-relaxed">{note.content}</p>
                    </div>

                    <div className="flex items-center gap-6 flex-shrink-0">
                      {note.aiSummary && (
                        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg border border-purple-100">
                          <Sparkles className="w-3 h-3 text-purple-600" />
                          <span className="text-[10px] font-black text-purple-900 uppercase tracking-widest leading-none">AI Summary</span>
                        </div>
                      )}

                      {note.actionItems && note.actionItems.length > 0 && (
                        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 uppercase tracking-widest leading-none">
                          <CheckSquare className="w-3.5 h-3.5" />
                          {note.actionItems.length}
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none border border-gray-100 px-3 py-1.5 rounded-lg">
                        <Calendar className="w-3.5 h-3.5" />
                        {note.date.toLocaleDateString()}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleStar(note.id); }}
                          className="p-2.5 hover:bg-yellow-100 rounded-xl transition-all duration-300 cursor-pointer"
                        >
                          <Star className={`w-5 h-5 ${note.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleTogglePin(note.id); }}
                          className="p-2.5 hover:bg-indigo-100 rounded-xl transition-all duration-300 cursor-pointer"
                        >
                          <Pin className={`w-5 h-5 ${note.isPinned ? 'text-indigo-600 fill-indigo-600' : 'text-gray-300'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {filteredNotes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-6 bg-linear-to-br from-indigo-100 to-purple-100 rounded-full mb-6">
            <FileText className="w-16 h-16 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No notes found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery ? 'Try adjusting your search or filters' : 'Create your first note to get started'}
          </p>
          <button
            onClick={() => setShowNewNoteModal(true)}
            className="px-6 py-3 bg-linear-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Create Note
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
