"use client";

import React, { useState } from 'react';
import { 
  FileText, Plus, Search, Filter, Star, Trash2, Edit3, 
  Calendar, Clock, Tag, Mic, Video, Users, Brain,
  Sparkles, Download, Share2, Archive, Pin, MoreVertical,
  CheckSquare, List, Grid, Folder, TrendingUp, Zap,
  BookOpen, Lightbulb, Target, MessageSquare, X, Check,
  ChevronRight, Eye, Copy, RefreshCw, Wand2
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

const noteTypes = [
  { id: 'meeting', name: 'Meeting Notes', icon: Users, color: 'from-blue-500 to-cyan-500', description: 'Capture meeting discussions and decisions' },
  { id: 'brainstorm', name: 'Brainstorm', icon: Lightbulb, color: 'from-yellow-500 to-orange-500', description: 'Creative ideas and innovation sessions' },
  { id: 'document', name: 'Document', icon: FileText, color: 'from-purple-500 to-pink-500', description: 'Formal documents and reports' },
  { id: 'task', name: 'Task List', icon: CheckSquare, color: 'from-green-500 to-emerald-500', description: 'Action items and to-dos' },
  { id: 'research', name: 'Research', icon: BookOpen, color: 'from-indigo-500 to-purple-500', description: 'Research findings and analysis' },
  { id: 'personal', name: 'Personal', icon: Star, color: 'from-pink-500 to-rose-500', description: 'Personal notes and thoughts' },
];

export default function AINotesPage() {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Q4 Strategy Planning Meeting',
      content: 'Discussed quarterly goals, budget allocation, and team expansion plans. Key focus on customer acquisition and product development.',
      type: 'meeting',
      date: new Date('2024-12-05'),
      tags: ['strategy', 'planning', 'Q4'],
      isPinned: true,
      isStarred: true,
      aiSummary: 'Strategic planning session covering Q4 objectives, budget distribution, and growth initiatives.',
      actionItems: ['Finalize Q4 budget by Dec 10', 'Schedule team expansion interviews', 'Review product roadmap'],
      participants: ['John Smith', 'Sarah Johnson', 'Mike Chen'],
      duration: '1h 30m'
    },
    {
      id: '2',
      title: 'Client Onboarding Process Ideas',
      content: 'Brainstorming session for improving client onboarding experience. Focus on automation and personalization.',
      type: 'brainstorm',
      date: new Date('2024-12-04'),
      tags: ['clients', 'onboarding', 'UX'],
      isPinned: false,
      isStarred: false,
      aiSummary: 'Ideas for enhancing client onboarding through automation and personalized experiences.',
      actionItems: ['Create onboarding flow diagram', 'Research automation tools', 'Design welcome email sequence']
    },
    {
      id: '3',
      title: 'Market Research - Competitor Analysis',
      content: 'Comprehensive analysis of top 5 competitors including pricing, features, and market positioning.',
      type: 'research',
      date: new Date('2024-12-03'),
      tags: ['research', 'competitors', 'market'],
      isPinned: false,
      isStarred: true,
      aiSummary: 'Detailed competitor analysis revealing pricing strategies and feature gaps in the market.'
    },
    {
      id: '4',
      title: 'Weekly Tasks - December Week 1',
      content: 'Priority tasks for the week including client deliverables, team meetings, and project milestones.',
      type: 'task',
      date: new Date('2024-12-02'),
      tags: ['tasks', 'weekly', 'priorities'],
      isPinned: true,
      isStarred: false,
      actionItems: ['Complete client proposal', 'Review team performance', 'Update project timeline', 'Prepare presentation']
    },
    {
      id: '5',
      title: 'Product Launch Strategy Document',
      content: 'Comprehensive strategy for upcoming product launch including marketing, sales, and support plans.',
      type: 'document',
      date: new Date('2024-12-01'),
      tags: ['product', 'launch', 'strategy'],
      isPinned: false,
      isStarred: true,
      aiSummary: 'Complete product launch strategy covering all aspects from marketing to customer support.'
    },
    {
      id: '6',
      title: 'Personal Development Goals 2025',
      content: 'Setting personal and professional development goals for the upcoming year.',
      type: 'personal',
      date: new Date('2024-11-30'),
      tags: ['personal', 'goals', '2025'],
      isPinned: false,
      isStarred: false,
      aiSummary: 'Personal growth objectives focusing on skills development and career advancement.'
    }
  ]);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showAIAssist, setShowAIAssist] = useState(false);

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

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const handleToggleStar = (id: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, isStarred: !n.isStarred } : n));
  };

  const handleTogglePin = (id: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n));
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
            AI Notes Studio
          </h1>
          <p className="text-gray-600 mt-2">Intelligent note-taking with AI-powered insights and organization</p>
        </div>
        <button
          onClick={() => setShowNewNoteModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center gap-2 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Create Note
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Notes</p>
              <p className="text-2xl font-bold text-blue-900">{notes.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Starred</p>
              <p className="text-2xl font-bold text-purple-900">{notes.filter(n => n.isStarred).length}</p>
            </div>
            <Star className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">This Week</p>
              <p className="text-2xl font-bold text-green-900">{notes.filter(n => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return n.date >= weekAgo;
              }).length}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Action Items</p>
              <p className="text-2xl font-bold text-orange-900">{notes.reduce((acc, n) => acc + (n.actionItems?.length || 0), 0)}</p>
            </div>
            <CheckSquare className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes, tags, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            {noteTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
          
          <div className="flex items-center gap-1 bg-white border-2 border-gray-200 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* New Note Modal */}
      {showNewNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">Create New Note</h2>
              <button
                onClick={() => setShowNewNoteModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Choose Note Type</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {noteTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        className="group relative bg-white rounded-xl border-2 border-gray-200 p-4 hover:border-transparent hover:shadow-xl transition-all text-left overflow-hidden"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                        <div className="relative">
                          <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${type.color} mb-2`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="font-bold text-gray-900 text-sm mb-1">{type.name}</h3>
                          <p className="text-xs text-gray-600">{type.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Note Title</label>
                  <input
                    type="text"
                    placeholder="Enter a descriptive title..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
                  <textarea
                    placeholder="Start typing or use AI to generate content..."
                    rows={8}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
                  <input
                    type="text"
                    placeholder="Add tags (comma-separated)"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Participants (Optional)</label>
                  <input
                    type="text"
                    placeholder="Add participants"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <div className="flex-1">
                  <h4 className="font-semibold text-purple-900">AI Assist</h4>
                  <p className="text-sm text-purple-700">Let AI help you organize, summarize, or expand your notes</p>
                </div>
                <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:shadow-lg transition-all">
                  Enable AI
                </button>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Voice input">
                    <Mic className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Record video">
                    <Video className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Add checklist">
                    <CheckSquare className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowNewNoteModal(false)}
                    className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-xl transition-all">
                    Create Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Note Detail Modal */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <div className="flex items-center gap-3">
                {React.createElement(getTypeConfig(selectedNote.type).icon, { className: 'w-6 h-6 text-indigo-600' })}
                <h2 className="text-2xl font-bold text-gray-900">{selectedNote.title}</h2>
              </div>
              <button
                onClick={() => setSelectedNote(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {selectedNote.date.toLocaleDateString()}
                </div>
                {selectedNote.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {selectedNote.duration}
                  </div>
                )}
                {selectedNote.participants && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {selectedNote.participants.length} participants
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {selectedNote.tags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* AI Summary */}
              {selectedNote.aiSummary && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-purple-900">AI Summary</h3>
                  </div>
                  <p className="text-purple-800">{selectedNote.aiSummary}</p>
                </div>
              )}

              {/* Content */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Content</h3>
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                  {selectedNote.content}
                </div>
              </div>

              {/* Action Items */}
              {selectedNote.actionItems && selectedNote.actionItems.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-green-600" />
                    Action Items
                  </h3>
                  <div className="space-y-2">
                    {selectedNote.actionItems.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <input type="checkbox" className="mt-1" />
                        <span className="text-gray-800">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Participants */}
              {selectedNote.participants && selectedNote.participants.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Participants
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedNote.participants.map((participant, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {participant.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-gray-800">{participant}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Copy">
                    <Copy className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Download">
                    <Download className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Share">
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                
                <button className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center gap-2">
                  <Edit3 className="w-5 h-5" />
                  Edit Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pinned Notes */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Pin className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">Pinned Notes</h2>
          </div>
          
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pinnedNotes.map((note) => {
                const typeConfig = getTypeConfig(note.type);
                const Icon = typeConfig.icon;
                return (
                  <div
                    key={note.id}
                    className="group relative bg-white rounded-xl border-2 border-gray-200 p-5 hover:border-transparent hover:shadow-2xl transition-all cursor-pointer overflow-hidden"
                    onClick={() => setSelectedNote(note)}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${typeConfig.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                    
                    <div className="relative">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${typeConfig.color}`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStar(note.id);
                            }}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Star className={`w-4 h-4 ${note.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTogglePin(note.id);
                            }}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Pin className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {note.title}
                      </h3>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {note.content}
                      </p>

                      {note.aiSummary && (
                        <div className="mb-3 p-2 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center gap-1 mb-1">
                            <Brain className="w-3 h-3 text-purple-600" />
                            <span className="text-xs font-semibold text-purple-900">AI Summary</span>
                          </div>
                          <p className="text-xs text-purple-700 line-clamp-2">{note.aiSummary}</p>
                        </div>
                      )}

                      {note.actionItems && note.actionItems.length > 0 && (
                        <div className="mb-3 flex items-center gap-2 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-lg border border-green-200">
                          <CheckSquare className="w-3 h-3" />
                          <span>{note.actionItems.length} action items</span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1 mb-3">
                        {note.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                            #{tag}
                          </span>
                        ))}
                        {note.tags.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                            +{note.tags.length - 3}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {note.date.toLocaleDateString()}
                        </div>
                        {note.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {note.duration}
                          </div>
                        )}
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
                    className="group bg-white rounded-xl border-2 border-gray-200 p-4 hover:border-indigo-300 hover:shadow-lg transition-all cursor-pointer flex items-center gap-4"
                    onClick={() => setSelectedNote(note)}
                  >
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${typeConfig.color} flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 mb-1 truncate group-hover:text-indigo-600 transition-colors">
                        {note.title}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">{note.content}</p>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      {note.actionItems && note.actionItems.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-lg">
                          <CheckSquare className="w-3 h-3" />
                          {note.actionItems.length}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {note.date.toLocaleDateString()}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStar(note.id);
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Star className={`w-4 h-4 ${note.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePin(note.id);
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Pin className="w-4 h-4 text-indigo-600 fill-indigo-600" />
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
      {regularNotes.length > 0 && (
        <div className="space-y-4">
          {pinnedNotes.length > 0 && (
            <h2 className="text-lg font-bold text-gray-900">All Notes</h2>
          )}
          
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {regularNotes.map((note) => {
                const typeConfig = getTypeConfig(note.type);
                const Icon = typeConfig.icon;
                return (
                  <div
                    key={note.id}
                    className="group relative bg-white rounded-xl border-2 border-gray-200 p-5 hover:border-transparent hover:shadow-2xl transition-all cursor-pointer overflow-hidden"
                    onClick={() => setSelectedNote(note)}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${typeConfig.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                    
                    <div className="relative">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${typeConfig.color}`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStar(note.id);
                            }}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Star className={`w-4 h-4 ${note.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTogglePin(note.id);
                            }}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Pin className={`w-4 h-4 ${note.isPinned ? 'text-indigo-600 fill-indigo-600' : 'text-gray-400'}`} />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {note.title}
                      </h3>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {note.content}
                      </p>

                      {note.aiSummary && (
                        <div className="mb-3 p-2 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center gap-1 mb-1">
                            <Brain className="w-3 h-3 text-purple-600" />
                            <span className="text-xs font-semibold text-purple-900">AI Summary</span>
                          </div>
                          <p className="text-xs text-purple-700 line-clamp-2">{note.aiSummary}</p>
                        </div>
                      )}

                      {note.actionItems && note.actionItems.length > 0 && (
                        <div className="mb-3 flex items-center gap-2 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-lg border border-green-200">
                          <CheckSquare className="w-3 h-3" />
                          <span>{note.actionItems.length} action items</span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1 mb-3">
                        {note.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                            #{tag}
                          </span>
                        ))}
                        {note.tags.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                            +{note.tags.length - 3}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {note.date.toLocaleDateString()}
                        </div>
                        {note.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {note.duration}
                          </div>
                        )}
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
                    className="group bg-white rounded-xl border-2 border-gray-200 p-4 hover:border-indigo-300 hover:shadow-lg transition-all cursor-pointer flex items-center gap-4"
                    onClick={() => setSelectedNote(note)}
                  >
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${typeConfig.color} flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 mb-1 truncate group-hover:text-indigo-600 transition-colors">
                        {note.title}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">{note.content}</p>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      {note.actionItems && note.actionItems.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-lg">
                          <CheckSquare className="w-3 h-3" />
                          {note.actionItems.length}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {note.date.toLocaleDateString()}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStar(note.id);
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Star className={`w-4 h-4 ${note.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePin(note.id);
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Pin className={`w-4 h-4 ${note.isPinned ? 'text-indigo-600 fill-indigo-600' : 'text-gray-400'}`} />
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
          <div className="p-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mb-6">
            <FileText className="w-16 h-16 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No notes found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery ? 'Try adjusting your search or filters' : 'Create your first note to get started'}
          </p>
          <button
            onClick={() => setShowNewNoteModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Note
          </button>
        </div>
      )}
    </div>
  );
}
