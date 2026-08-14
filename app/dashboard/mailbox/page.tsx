"use client";

import { useState, useEffect, useRef } from 'react';
import { sanitizeHtml } from '@/lib/sanitize';
import Link from 'next/link';
import {
  Mail, Trash2, Search, RefreshCw, Star,
  MoreVertical, Reply, Forward, Paperclip, FileText, Image as ImageIcon,
  ChevronLeft, Loader2,
  Inbox as InboxIcon, Send as SendIcon,
  Trash as TrashIcon, AlertTriangle as SpamIcon,
  X, Send as SendActionIcon, PenSquare, Upload,
  UserPlus, Receipt, LifeBuoy, Tag, Check
} from 'lucide-react';
import TourProvider from '@/components/tours/TourProvider';
import { ModuleGuideBanner } from '@/components/tours/ModuleGuideBanner';
import { mailboxTourSteps } from './tour-steps';

const MAIL_LABELS = [
  { color: 'bg-pink-500', bgSoft: 'bg-pink-50', text: 'text-pink-600', label: 'Marketing' },
  { color: 'bg-blue-500', bgSoft: 'bg-blue-50', text: 'text-blue-600', label: 'Clients' },
  { color: 'bg-amber-500', bgSoft: 'bg-amber-50', text: 'text-amber-600', label: 'Priority' },
] as const;

interface ComposeAttachment {
  objectKey: string;
  filename: string;
  size: number;
  contentType: string;
}

interface Attachment {
  filename: string;
  contentType?: string;
  size?: number;
}

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
  label?: string | null;
  hasAttachments: boolean;
  attachments?: Attachment[];
}

interface ContextContact {
  id: string;
  name: string;
  company?: string | null;
  pipelineStage: string;
}

interface ContextInvoice {
  id: string;
  number: string;
  amount: number;
  status: string;
}

interface ContextTicket {
  id: string;
  subject: string;
  status: string;
}

interface ClientContext {
  contact: ContextContact | null;
  invoices: ContextInvoice[];
  tickets: ContextTicket[];
}

export default function MailboxPage() {
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<'INBOX' | 'SENT' | 'TRASH' | 'SPAM'>('INBOX');
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null);
  const [showLabelMenu, setShowLabelMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({ to: '', subject: '', content: '' });
  const [composeAttachments, setComposeAttachments] = useState<ComposeAttachment[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendToast, setSendToast] = useState(false);
  const [showMessageMenu, setShowMessageMenu] = useState(false);
  const [clientContext, setClientContext] = useState<ClientContext | null>(null);
  const [contextLoading, setContextLoading] = useState(false);
  const contextCacheRef = useRef<Record<string, ClientContext>>({});

  useEffect(() => {
    if (!selectedMessage) { setClientContext(null); return; }

    const senderEmail = selectedMessage.from.match(/<([^>]+)>/)?.[1] || selectedMessage.from;
    if (!senderEmail) { setClientContext(null); return; }

    const cached = contextCacheRef.current[senderEmail];
    if (cached) { setClientContext(cached); return; }

    setContextLoading(true);
    fetch(`/api/crm/context?email=${encodeURIComponent(senderEmail)}`)
      .then(res => res.json())
      .then((data: ClientContext) => {
        contextCacheRef.current[senderEmail] = data;
        setClientContext(data);
      })
      .catch(() => setClientContext(null))
      .finally(() => setContextLoading(false));
  }, [selectedMessage]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingFile(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('folder', 'email-attachments');
        const res = await fetch('/api/storage/upload', { method: 'POST', body: fd });
        if (res.ok) {
          const data = await res.json();
          setComposeAttachments(prev => [...prev, {
            objectKey: data.objectKey,
            filename: data.filename,
            size: data.size,
            contentType: data.contentType,
          }]);
        }
      }
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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
    setSendError(null);
    try {
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
          attachmentKeys: composeAttachments,
        }),
      });
      if (res.ok) {
        setShowCompose(false);
        setComposeData({ to: '', subject: '', content: '' });
        setComposeAttachments([]);
        setSendToast(true);
        setTimeout(() => setSendToast(false), 4000);
        fetchMessages(false);
      } else {
        const err = await res.json();
        setSendError(err.error || 'Failed to send. Please try again.');
      }
    } catch {
      setSendError('Network error. Please check your connection and try again.');
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
      content: `\n\n\n--- Original Message ---\nFrom: ${selectedMessage.from}\nDate: ${new Date(selectedMessage.date).toLocaleString()}\n\n${selectedMessage.body}`,
    });
    setShowCompose(true);
    setShowMessageMenu(false);
  };

  const handleForward = () => {
    if (!selectedMessage) return;
    setComposeData({
      to: '',
      subject: selectedMessage.subject.startsWith('Fwd:') ? selectedMessage.subject : `Fwd: ${selectedMessage.subject}`,
      content: `\n\n\n--- Forwarded Message ---\nFrom: ${selectedMessage.from}\nDate: ${new Date(selectedMessage.date).toLocaleString()}\nSubject: ${selectedMessage.subject}\n\n${selectedMessage.body}`,
    });
    setShowCompose(true);
    setShowMessageMenu(false);
  };

  const handleMoveToSpam = () => {
    if (!selectedMessage) return;
    updateMessage(selectedMessage.id, { folder: 'SPAM' });
    setSelectedMessage(null);
    setShowMessageMenu(false);
  };

  const getAttachmentIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return ImageIcon;
    return FileText;
  };

  const filteredMessages = messages
    .filter(m => m.folder === selectedFolder)
    .filter(m => !selectedLabel || m.label === selectedLabel)
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

  const unreadCount = messages.filter(m => m.folder === 'INBOX' && m.status === 'UNREAD').length;

  return (
    <div
      className="flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
      style={{ height: 'calc(100vh - 120px)' }}
    >
      <TourProvider moduleId="mailbox" steps={mailboxTourSteps} />

      {/* Header */}
      <div id="tour-mailbox-header" className="shrink-0 border-b border-slate-200/80 bg-white px-3.5 sm:px-6 py-2.5 sm:py-3 space-y-2.5 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {selectedMessage ? (
            <button
              onClick={() => setSelectedMessage(null)}
              className="lg:hidden flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 transition cursor-pointer shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20">
              <Mail className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </div>
          )}
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 leading-tight truncate">
                Mail Engine &amp; Inbox
              </h1>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
                Live Sync
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate hidden sm:block">
              Send, receive &amp; manage secure business emails
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0">
          {/* Desktop search */}
          <div className="hidden md:flex items-center relative">
            <Search className="absolute left-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48 lg:w-56 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
            />
          </div>

          <ModuleGuideBanner
            moduleId="mailbox"
            moduleName="Mailbox Engine"
            summary="Send, receive, track, and organize inbound and outbound business emails securely."
            tips={[
              "Compose rich emails with attachments & verified Postal server domains",
              "Organize mail by Inbox, Sent, Drafts, Archived, and Spam",
              "Track real-time delivery status and open notifications"
            ]}
          />

          <button
            onClick={() => fetchMessages(true)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition cursor-pointer"
            title="Sync Mail"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          </button>

          <button
            id="tour-mailbox-compose"
            onClick={() => { setComposeData({ to: '', subject: '', content: '' }); setComposeAttachments([]); setShowCompose(true); }}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-indigo-600/20 whitespace-nowrap"
          >
            <PenSquare className="w-4 h-4" />
            <span>Compose</span>
          </button>

          <button
            onClick={() => setShowSearch(v => !v)}
            className="md:hidden p-2 bg-slate-100 rounded-xl text-slate-600 cursor-pointer"
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
        <div className="lg:hidden shrink-0 bg-white/95 backdrop-blur-sm border-b border-slate-200/80">
          <div className="flex overflow-x-auto scrollbar-none px-4 sm:px-6 gap-1">
            {folders.map((folder) => {
              const isActive = selectedFolder === folder.id;
              const Icon = folder.icon;
              return (
                <button
                  key={folder.id}
                  onClick={() => { setSelectedFolder(folder.id); setSelectedMessage(null); setSelectedLabel(null); }}
                  className={`flex items-center gap-2 px-3.5 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer shrink-0 ${
                    isActive ? "border-indigo-600 text-indigo-600 bg-indigo-50/40" : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? folder.color : 'text-slate-400'}`} />
                  <span>{folder.label}</span>
                  {folder.id === 'INBOX' && unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-bold border border-indigo-200/60 leading-none">
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
        <div id="tour-mailbox-folders" className="hidden lg:flex w-52 border-r border-slate-200/80 bg-slate-50/50 flex-col p-3 gap-1 shrink-0">
          {folders.map((folder) => {
            const Icon = folder.icon;
            const isActive = selectedFolder === folder.id;
            return (
              <button
                key={folder.id}
                onClick={() => { setSelectedFolder(folder.id); setSelectedMessage(null); setSelectedLabel(null); }}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive ? 'bg-white text-indigo-600 shadow-2xs border border-slate-200/80' : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? folder.color : 'text-slate-400'}`} />
                  {folder.label}
                </div>
                {folder.id === 'INBOX' && unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-md text-[10px] font-bold border border-indigo-200/60">{unreadCount}</span>
                )}
              </button>
            );
          })}

          <div className="mt-5 px-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Labels</p>
            <div className="space-y-1">
              {MAIL_LABELS.map(l => {
                const isActive = selectedLabel === l.label;
                return (
                  <button
                    key={l.label}
                    onClick={() => { setSelectedLabel(isActive ? null : l.label); setSelectedMessage(null); }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive ? `${l.bgSoft} ${l.text} border border-slate-200/60` : 'text-slate-500 hover:text-slate-900 hover:bg-white/70'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${l.color} shrink-0`} />
                    {l.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Message List */}
        <div className={`flex-1 flex flex-col min-w-0 bg-white ${selectedMessage ? 'hidden lg:flex' : 'flex'}`}>
          {selectedLabel && (
            <div className="shrink-0 flex items-center gap-2 px-4 py-2 border-b border-slate-100 bg-slate-50/60">
              <span className="text-xs text-slate-500">Filtered by label:</span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-slate-200/60 ${MAIL_LABELS.find(l => l.label === selectedLabel)?.bgSoft} ${MAIL_LABELS.find(l => l.label === selectedLabel)?.text}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${MAIL_LABELS.find(l => l.label === selectedLabel)?.color}`} />
                {selectedLabel}
              </span>
              <button
                onClick={() => setSelectedLabel(null)}
                className="ml-auto p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <Loader2 className="w-9 h-9 text-indigo-600 animate-spin" />
                <p className="text-xs text-slate-400 font-semibold">Loading messages...</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                  <InboxIcon className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-500">
                  No messages in {selectedFolder.toLowerCase()}{selectedLabel ? ` labeled "${selectedLabel}"` : ''}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredMessages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => handleMessageClick(msg)}
                    className={`group flex items-center gap-3 px-4 py-3 sm:py-3.5 cursor-pointer transition-colors border-l-2 ${
                      selectedMessage?.id === msg.id
                        ? 'bg-indigo-50/60 border-l-indigo-600'
                        : 'hover:bg-slate-50/80 border-l-transparent'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold transition-transform group-hover:scale-105 ${
                      msg.status === 'UNREAD' 
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs font-extrabold' 
                        : 'bg-slate-100 text-slate-700 border border-slate-200/80'
                    }`}>
                      {(selectedFolder === 'SENT' ? msg.to : msg.from).charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className={`text-xs sm:text-sm truncate ${msg.status === 'UNREAD' ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                          {selectedFolder === 'SENT'
                            ? (msg.to.split('<')[0].trim() || msg.to)
                            : (msg.from.split('<')[0].trim() || msg.from)}
                        </p>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 shrink-0">
                          {new Date(msg.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className={`text-xs truncate mb-0.5 ${msg.status === 'UNREAD' ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                        {msg.subject}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {msg.body.substring(0, 80)}...
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {msg.label && (
                        <div
                          className={`w-2 h-2 rounded-full shrink-0 ${MAIL_LABELS.find(l => l.label === msg.label)?.color || 'bg-slate-300'}`}
                          title={msg.label}
                        />
                      )}
                      {msg.status === 'UNREAD' && (
                        <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                      )}
                      {msg.hasAttachments && (
                        <Paperclip className="w-3.5 h-3.5 text-slate-400" />
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
                <div className="relative">
                  <button
                    onClick={() => setShowLabelMenu(v => !v)}
                    className={`p-2 rounded-xl transition-colors cursor-pointer ${
                      selectedMessage.label
                        ? `${MAIL_LABELS.find(l => l.label === selectedMessage.label)?.bgSoft} ${MAIL_LABELS.find(l => l.label === selectedMessage.label)?.text}`
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    <Tag className="w-4 h-4" />
                  </button>
                  {showLabelMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowLabelMenu(false)} />
                      <div className="absolute left-0 top-10 z-20 w-40 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden">
                        <button
                          onClick={() => { updateMessage(selectedMessage.id, { label: null }); setShowLabelMenu(false); }}
                          className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          No label
                          {!selectedMessage.label && <Check className="w-3.5 h-3.5" />}
                        </button>
                        {MAIL_LABELS.map(l => (
                          <button
                            key={l.label}
                            onClick={() => { updateMessage(selectedMessage.id, { label: l.label }); setShowLabelMenu(false); }}
                            className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${l.color} shrink-0`} />
                              {l.label}
                            </span>
                            {selectedMessage.label === l.label && <Check className="w-3.5 h-3.5" />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 relative">
                {selectedFolder !== 'SENT' && (
                  <button
                    onClick={handleReply}
                    className="flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer shadow-sm"
                  >
                    <Reply className="w-4 h-4" /> Reply
                  </button>
                )}
                <button
                  onClick={handleForward}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  <Forward className="w-4 h-4" /> Forward
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowMessageMenu(v => !v)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {showMessageMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowMessageMenu(false)} />
                      <div className="absolute right-0 top-10 z-20 w-48 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden py-1">
                        {selectedFolder !== 'SENT' && (
                          <button
                            onClick={() => { handleReply(); setShowMessageMenu(false); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                          >
                            <Reply className="w-4 h-4 text-indigo-600" /> Reply to Sender
                          </button>
                        )}
                        <button
                          onClick={() => { handleForward(); setShowMessageMenu(false); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <Forward className="w-4 h-4 text-gray-500" /> Forward Message
                        </button>
                        <div className="h-px bg-gray-100 my-1" />
                        <button
                          onClick={handleMoveToSpam}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                        >
                          <SpamIcon className="w-4 h-4" /> Mark as Spam
                        </button>
                        <button
                          onClick={() => { updateMessage(selectedMessage!.id, { folder: 'TRASH' }); setSelectedMessage(null); setShowMessageMenu(false); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" /> Move to Trash
                        </button>
                      </div>
                    </>
                  )}
                </div>
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

              {/* Unified Context: 360° client snapshot, no tab-switching required */}
              {contextLoading ? (
                <div className="flex items-center gap-2 text-gray-400 text-xs py-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading client context…
                </div>
              ) : clientContext?.contact ? (
                <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{clientContext.contact.name}</p>
                      {clientContext.contact.company && (
                        <p className="text-xs text-gray-500">{clientContext.contact.company}</p>
                      )}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 bg-white rounded-full border border-indigo-200 text-indigo-600">
                      {clientContext.contact.pipelineStage.replace('_', ' ')}
                    </span>
                  </div>

                  {clientContext.invoices.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                        <Receipt className="w-3 h-3" /> Recent Invoices
                      </p>
                      <div className="space-y-1">
                        {clientContext.invoices.map(inv => (
                          <div key={inv.id} className="flex items-center justify-between text-xs bg-white rounded-lg px-2.5 py-1.5 border border-gray-100">
                            <span className="font-medium text-gray-700">{inv.number}</span>
                            <span className="flex items-center gap-2">
                              <span className="text-gray-500">£{inv.amount.toFixed(2)}</span>
                              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                                inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                                inv.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                                'bg-amber-100 text-amber-700'
                              }`}>
                                {inv.status}
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {clientContext.tickets.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                        <LifeBuoy className="w-3 h-3" /> Recent Tickets
                      </p>
                      <div className="space-y-1">
                        {clientContext.tickets.map(t => (
                          <div key={t.id} className="flex items-center justify-between text-xs bg-white rounded-lg px-2.5 py-1.5 border border-gray-100">
                            <span className="font-medium text-gray-700 truncate">{t.subject}</span>
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-700 shrink-0">
                              {t.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Link href="/dashboard/crm" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-block">
                    View in CRM →
                  </Link>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-xs text-gray-400">No CRM record for this sender</p>
                  <Link
                    href="/dashboard/crm"
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Create Contact
                  </Link>
                </div>
              )}

              <div className="text-sm text-gray-700 leading-relaxed">
                {selectedMessage.html ? (
                  <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedMessage.html) }} />
                ) : (
                  <pre className="whitespace-pre-wrap font-sans text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
                    {selectedMessage.body}
                  </pre>
                )}
              </div>

              {selectedMessage.hasAttachments && selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
                    Attachments ({selectedMessage.attachments.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedMessage.attachments.map((att, i) => {
                      const Icon = getAttachmentIcon(att.filename);
                      const isImage = att.contentType?.startsWith('image/');
                      const sizeLabel = att.size
                        ? att.size > 1024 * 1024
                          ? `${(att.size / (1024 * 1024)).toFixed(1)} MB`
                          : `${Math.round(att.size / 1024)} KB`
                        : null;
                      const ext = att.filename.split('.').pop()?.toUpperCase() || 'FILE';
                      return (
                        <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-all">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isImage ? 'bg-purple-50' : 'bg-indigo-50'}`}>
                            <Icon className={`w-4 h-4 ${isImage ? 'text-purple-600' : 'text-indigo-600'}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900 truncate">{att.filename}</p>
                            <p className="text-[11px] text-gray-400">
                              {[sizeLabel, ext].filter(Boolean).join(' · ')}
                            </p>
                          </div>
                          <Paperclip className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                        </div>
                      );
                    })}
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

      {/* Sent success toast */}
      {sendToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-5 py-3.5 bg-emerald-600 text-white rounded-2xl shadow-xl text-sm font-semibold animate-in slide-in-from-bottom-4 duration-300">
          <SendActionIcon className="w-4 h-4" />
          Email sent successfully!
        </div>
      )}

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
            onClick={() => setShowCompose(false)}
          />
          <div className="relative z-10 w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col h-[92dvh] sm:h-auto sm:max-h-[88dvh] overflow-hidden">

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
                onClick={() => { setShowCompose(false); setComposeAttachments([]); }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSend} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 pb-8 space-y-4">
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
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm text-gray-700 placeholder:text-gray-400 outline-none transition-all resize-none min-h-[140px] sm:min-h-[200px]"
                    placeholder="Write your message..."
                  />
                </div>

                {/* Send Error */}
                {sendError && (
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 font-medium">
                    <X className="w-4 h-4 shrink-0 text-red-400" />
                    {sendError}
                  </div>
                )}

                {/* Actions: Attach files and Send */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <div className="flex flex-row items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingFile}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {uploadingFile
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Paperclip className="w-4 h-4" />}
                      {uploadingFile ? 'Uploading...' : 'Attach files'}
                    </button>
                    <button
                      type="submit"
                      disabled={sending}
                      className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
                    >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendActionIcon className="w-4 h-4" />}
                      {sending ? 'Sending...' : 'Send'}
                    </button>
                  </div>

                  {composeAttachments.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {composeAttachments.map((att, i) => {
                        const sizeLabel = att.size > 1024 * 1024
                          ? `${(att.size / (1024 * 1024)).toFixed(1)} MB`
                          : `${Math.round(att.size / 1024)} KB`;
                        const isImage = att.contentType.startsWith('image/');
                        return (
                          <div key={i} className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-xl">
                            {isImage
                              ? <ImageIcon className="w-4 h-4 text-purple-500 shrink-0" />
                              : <FileText className="w-4 h-4 text-indigo-500 shrink-0" />}
                            <span className="text-xs font-semibold text-gray-800 flex-1 truncate">{att.filename}</span>
                            <span className="text-xs text-gray-400 shrink-0">{sizeLabel}</span>
                            <button
                              type="button"
                              onClick={() => setComposeAttachments(prev => prev.filter((_, j) => j !== i))}
                              className="p-0.5 hover:bg-indigo-200 rounded-md transition-colors cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5 text-gray-500" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
