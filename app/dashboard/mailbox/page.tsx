"use client";

import { useState, useEffect } from 'react';
import { sanitizeHtml } from '@/lib/sanitize';
import {
  Mail, Trash2, Search, RefreshCw, Star,
  MoreVertical, Reply, Paperclip,
  ChevronLeft, Loader2,
  Inbox as InboxIcon, Send as SendIcon,
  Trash as TrashIcon, AlertTriangle as SpamIcon,
  X, Send as SendActionIcon, PenSquare
} from 'lucide-react';

interface EmailMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  html?: string;
  date: string;
  status: 'READ' | 'UNREAD' | 'FLAGGED';
  folder: 'INBOX' | 'SENT' | 'DRAFTS' | 'TRASH' | 'SPAM';
  hasAttachments: boolean;
}

export default function MailboxPage() {
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<'INBOX' | 'SENT' | 'TRASH' | 'SPAM'>('INBOX');
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({ to: '', subject: '', content: '' });
  const [sending, setSending] = useState(false);

  const fetchMessages = async (forceSync = false) => {
    if (forceSync) setSyncing(true);
    try {
      const res = await fetch('/api/email/inbox');
      if (res.ok) setMessages(await res.json());
    } catch (err) {
      console.error('Failed to fetch mail:', err);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

  const updateMessage = async (id: string, updates: Partial<EmailMessage>) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    if (selectedMessage?.id === id) setSelectedMessage(prev => prev ? { ...prev, ...updates } : null);
    try {
      await fetch(`/api/email/inbox/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.error('Failed to update message:', err);
    }
  };

  const handleMessageClick = (msg: EmailMessage) => {
    setSelectedMessage(msg);
    if (msg.status === 'UNREAD') updateMessage(msg.id, { status: 'READ' });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      // Convert plain text to minimal HTML; keep plain text for fallback
      const paragraphs = composeData.content
        .split('\n')
        .map(l => l.trim() ? `<p>${l}</p>` : '<br/>')
        .join('');
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: composeData.to,
          subject: composeData.subject,
          html: paragraphs,
          text: composeData.content,
        }),
      });
      if (res.ok) {
        setShowCompose(false);
        setComposeData({ to: '', subject: '', content: '' });
      } else {
        const err = await res.json();
        console.error('Send failed:', err.error);
      }
    } catch (err) {
      console.error('Failed to send:', err);
    } finally {
      setSending(false);
    }
  };

  const handleReply = () => {
    if (!selectedMessage) return;
    const match = selectedMessage.from.match(/<([^>]+)>/);
    const toEmail = match ? match[1] : selectedMessage.from;
    setComposeData({
      to: toEmail,
      subject: selectedMessage.subject.startsWith('Re:') ? selectedMessage.subject : `Re: ${selectedMessage.subject}`,
      content: `\n\n\n--- Original Message ---\nFrom: ${selectedMessage.from}\nDate: ${new Date(selectedMessage.date).toLocaleString()}\n\n${selectedMessage.body}`
    });
    setShowCompose(true);
  };

  const filteredMessages = messages
    .filter(m => m.folder === selectedFolder)
    .filter(m =>
      m.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.from.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const folders = [
    { id: 'INBOX', label: 'Inbox',  icon: InboxIcon,  color: 'text-indigo-500' },
    { id: 'SENT',  label: 'Sent',   icon: SendIcon,   color: 'text-emerald-500' },
    { id: 'SPAM',  label: 'Spam',   icon: SpamIcon,   color: 'text-amber-500' },
    { id: 'TRASH', label: 'Trash',  icon: TrashIcon,  color: 'text-rose-500' },
  ] as const;

  const unreadCount = messages.filter(m => m.status === 'UNREAD').length;

  return (
    <div
      className="flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
      style={{ height: 'calc(100vh - 120px)' }}
    >

      {/* Header */}
      <div className="shrink-0 border-b border-gray-100 bg-white px-4 sm:px-5 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {selectedMessage ? (
            <button
              onClick={() => setSelectedMessage(null)}
              className="lg:hidden flex items-center justify-center w-9 h-9 bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <>
              <div className="p-2 bg-indigo-600 rounded-xl shrink-0">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base font-bold text-gray-900 leading-tight">Mailbox</h1>
                <p className="text-xs text-gray-400 hidden sm:block">Your email inbox</p>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Desktop search */}
          <div className="hidden md:flex items-center relative">
            <Search className="absolute left-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-52 pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
          <button
            onClick={() => fetchMessages(true)}
            className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => { setComposeData({ to: '', subject: '', content: '' }); setShowCompose(true); }}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <PenSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Compose</span>
          </button>
          <button
            onClick={() => setShowSearch(v => !v)}
            className="md:hidden p-2 bg-gray-100 rounded-xl text-gray-500 cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile search */}
      {showSearch && (
        <div className="md:hidden shrink-0 px-4 py-2 border-b border-gray-100 bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Mobile folder tabs */}
      {!selectedMessage && (
        <div className="lg:hidden shrink-0 bg-white border-b border-gray-100">
          <div className="flex overflow-x-auto scrollbar-hide px-4">
            {folders.map((folder) => {
              const isActive = selectedFolder === folder.id;
              const Icon = folder.icon;
              return (
                <button
                  key={folder.id}
                  onClick={() => { setSelectedFolder(folder.id); setSelectedMessage(null); }}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-colors cursor-pointer shrink-0 ${
                    isActive ? `border-indigo-600 text-indigo-600` : 'border-transparent text-gray-400 hover:text-gray-700'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? folder.color : 'text-gray-400'}`} />
                  {folder.label}
                  {folder.id === 'INBOX' && unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-indigo-600 text-white rounded-full text-[9px] font-bold leading-none">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Body */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Desktop Sidebar */}
        <div className="hidden lg:flex w-52 border-r border-gray-100 bg-gray-50/40 flex-col p-3 gap-0.5 shrink-0">
          {folders.map((folder) => {
            const Icon = folder.icon;
            const isActive = selectedFolder === folder.id;
            return (
              <button
                key={folder.id}
                onClick={() => { setSelectedFolder(folder.id); setSelectedMessage(null); }}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                  isActive ? 'bg-white text-indigo-600 shadow-sm border border-gray-100' : 'text-gray-500 hover:bg-white/70 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? folder.color : 'text-gray-400'}`} />
                  {folder.label}
                </div>
                {folder.id === 'INBOX' && unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded-lg text-[10px] font-bold">{unreadCount}</span>
                )}
              </button>
            );
          })}

          <div className="mt-5 px-3">
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-2.5">Labels</p>
            <div className="space-y-2">
              {[{ color: 'bg-pink-500', label: 'Marketing' }, { color: 'bg-blue-500', label: 'Clients' }, { color: 'bg-amber-500', label: 'Priority' }].map(l => (
                <div key={l.label} className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-gray-700 cursor-pointer transition-colors">
                  <div className={`w-2 h-2 rounded-full ${l.color} shrink-0`} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Message List */}
        <div className={`flex-1 flex flex-col min-w-0 border-r border-gray-100 bg-white ${selectedMessage ? 'hidden lg:flex' : 'flex'}`}>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-xs text-gray-400 font-semibold">Loading messages...</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <InboxIcon className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-400">No messages in {selectedFolder.toLowerCase()}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filteredMessages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => handleMessageClick(msg)}
                    className={`group flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors border-l-2 ${
                      selectedMessage?.id === msg.id
                        ? 'bg-indigo-50 border-l-indigo-600'
                        : 'hover:bg-gray-50 border-l-transparent'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold ${
                      msg.status === 'UNREAD' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {msg.from.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className={`text-sm truncate ${msg.status === 'UNREAD' ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>
                          {msg.from.split('<')[0].trim() || msg.from}
                        </p>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {new Date(msg.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className={`text-xs truncate mb-0.5 ${msg.status === 'UNREAD' ? 'font-semibold text-gray-800' : 'text-gray-400'}`}>
                        {msg.subject}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate">
                        {msg.body.substring(0, 80)}...
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {msg.status === 'UNREAD' && (
                        <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                      )}
                      {msg.hasAttachments && (
                        <Paperclip className="w-3.5 h-3.5 text-gray-300" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message Detail */}
        {selectedMessage ? (
          <div className="flex-1 lg:flex-[1.8] flex flex-col bg-white overflow-hidden">
            {/* Detail header */}
            <div className="shrink-0 border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 bg-white">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateMessage(selectedMessage.id, { status: 'FLAGGED' })}
                  className="p-2 bg-gray-100 hover:bg-amber-50 rounded-xl text-gray-400 hover:text-amber-500 transition-colors cursor-pointer"
                >
                  <Star className={`w-4 h-4 ${selectedMessage.status === 'FLAGGED' ? 'fill-amber-500 text-amber-500' : ''}`} />
                </button>
                <button
                  onClick={() => { updateMessage(selectedMessage.id, { folder: 'TRASH' }); setSelectedMessage(null); }}
                  className="p-2 bg-gray-100 hover:bg-rose-50 rounded-xl text-gray-400 hover:text-rose-500 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReply}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  <Reply className="w-4 h-4" /> Reply
                </button>
                <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-400 transition-colors cursor-pointer">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 pb-28 lg:pb-8 space-y-5">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
                {selectedMessage.subject}
              </h2>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-base font-bold shrink-0">
                  {selectedMessage.from.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {selectedMessage.from.split('<')[0].trim()}
                    </p>
                    <span className="text-[11px] text-gray-400 shrink-0">
                      {new Date(selectedMessage.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-500 truncate mt-0.5">
                    {selectedMessage.from.match(/<([^>]+)>/)?.[1] || selectedMessage.from}
                  </p>
                </div>
              </div>

              <div className="text-sm text-gray-700 leading-relaxed">
                {selectedMessage.html ? (
                  <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedMessage.html) }} />
                ) : (
                  <pre className="whitespace-pre-wrap font-sans text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
                    {selectedMessage.body}
                  </pre>
                )}
              </div>

              {selectedMessage.hasAttachments && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Attachments</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-all cursor-pointer">
                      <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                        <Paperclip className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">proposal_node.pdf</p>
                        <p className="text-[11px] text-gray-400">1.2 MB · PDF</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile sticky footer (above bottom nav) */}
            <div className="lg:hidden fixed bottom-24 left-0 right-0 z-40 px-4 pb-2">
              <div className="flex gap-2 bg-white border border-gray-200 rounded-2xl shadow-lg p-2">
                <button
                  onClick={handleReply}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer"
                >
                  <Reply className="w-4 h-4" /> Reply
                </button>
                <button
                  onClick={() => { updateMessage(selectedMessage.id, { folder: 'TRASH' }); setSelectedMessage(null); }}
                  className="px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-100 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Desktop empty state */
          <div className="hidden lg:flex flex-[1.8] items-center justify-center bg-gray-50/30">
            <div className="text-center space-y-4 max-w-xs">
              <div className="w-16 h-16 bg-white border border-gray-200 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <Mail className="w-8 h-8 text-gray-300" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">No message selected</h3>
                <p className="text-sm text-gray-400">Choose a message from the list to read it here.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
            onClick={() => setShowCompose(false)}
          />
          <div className="relative z-10 w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden">

            {/* Handle */}
            <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-100 rounded-xl">
                  <PenSquare className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">New Message</h3>
                  <p className="text-xs text-gray-400">Compose an email</p>
                </div>
              </div>
              <button
                onClick={() => setShowCompose(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSend} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">To</label>
                  <input
                    type="email"
                    required
                    value={composeData.to}
                    onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all"
                    placeholder="recipient@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Subject</label>
                  <input
                    type="text"
                    required
                    value={composeData.subject}
                    onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all"
                    placeholder="Email subject..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Message</label>
                  <textarea
                    required
                    value={composeData.content}
                    onChange={(e) => setComposeData({ ...composeData, content: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm text-gray-700 placeholder:text-gray-400 outline-none transition-all resize-none min-h-[200px]"
                    placeholder="Write your message..."
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="shrink-0 bg-white border-t border-gray-100 px-5 py-3 flex flex-row gap-2.5 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:pb-3">
                <button
                  type="button"
                  onClick={() => setShowCompose(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="flex-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendActionIcon className="w-4 h-4" />}
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
