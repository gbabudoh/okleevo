"use client";

import { useState, useEffect, useRef } from 'react';
import { sanitizeHtml } from '@/lib/sanitize';
import Link from 'next/link';
import {
  Mail, Trash2, Search, RefreshCw, Star,
  MoreVertical, Reply, Forward, Paperclip, FileText, Image as ImageIcon,
  ChevronLeft, Loader2, ArrowLeft,
  Inbox as InboxIcon, Send as SendIcon,
  Trash as TrashIcon, AlertTriangle as SpamIcon,
  X, Send as SendActionIcon, PenSquare, Upload,
  UserPlus, Receipt, LifeBuoy, Tag, Check,
  PanelRight, PanelBottom, Maximize2
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
  const [viewPaneMode, setViewPaneMode] = useState<'right' | 'bottom' | 'off'>('right');
  const [densityMode, setDensityMode] = useState<'comfortable' | 'compact'>('comfortable');
  const [showViewMenu, setShowViewMenu] = useState(false);
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

  const getLabelCount = (labelName: string) => messages.filter(m => m.label === labelName).length;

  return (
    <div
      className="flex flex-col bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs"
      style={{ height: 'calc(100vh - 120px)' }}
    >
      <TourProvider moduleId="mailbox" steps={mailboxTourSteps} />

      {/* ── Glassmorphic Sticky Header ── */}
      <div id="tour-mailbox-header" className="shrink-0 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {selectedMessage ? (
            <button
              onClick={() => setSelectedMessage(null)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-2xl text-xs font-extrabold shadow-sm transition active:scale-95 cursor-pointer shrink-0"
              title="Back to email list"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-orange-500 border border-orange-200/60 dark:border-orange-900/40 flex items-center justify-center shrink-0 shadow-2xs">
              <Mail className="w-5 h-5" />
            </div>
          )}
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base lg:text-lg font-extrabold text-slate-900 dark:text-white leading-tight truncate">
                {selectedMessage ? selectedMessage.subject : 'Mail Engine & Inbox'}
              </h1>
              {!selectedMessage && (
                <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold font-mono bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-900/40 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" /> Live Sync
                </span>
              )}
            </div>
            {!selectedMessage && (
              <p className="text-xs font-bold text-slate-400 truncate hidden sm:block mt-0.5">
                Send, receive &amp; manage secure business emails
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Desktop Search Bar */}
          <div className={`hidden md:flex items-center relative ${selectedMessage ? 'lg:flex' : ''}`}>
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48 lg:w-60 pl-10 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none focus:border-orange-500 transition placeholder:text-slate-400"
            />
          </div>

          <div className={selectedMessage ? 'hidden lg:block' : 'block'}>
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
          </div>

          {/* View Pane Display Menu Dropdown */}
          <div className={`relative ${selectedMessage ? 'hidden lg:block' : 'block'}`}>
            <button
              onClick={() => setShowViewMenu(v => !v)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 hover:border-orange-400 rounded-2xl text-xs font-extrabold text-slate-700 dark:text-slate-300 transition cursor-pointer shadow-2xs"
              title="Reading Pane & Display Options"
            >
              {viewPaneMode === 'right' && <PanelRight className="w-4 h-4 text-orange-500" />}
              {viewPaneMode === 'bottom' && <PanelBottom className="w-4 h-4 text-orange-500" />}
              {viewPaneMode === 'off' && <Maximize2 className="w-4 h-4 text-orange-500" />}
              <span className="hidden xl:inline">View</span>
            </button>

            {showViewMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowViewMenu(false)} />
                <div className="absolute right-0 top-11 z-40 w-56 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xl p-2 space-y-2">
                  <div>
                    <p className="px-3 py-1 text-[10px] font-extrabold font-mono text-slate-400 uppercase tracking-widest">
                      Reading Pane Position
                    </p>
                    <div className="space-y-1 mt-1">
                      <button
                        onClick={() => { setViewPaneMode('right'); setShowViewMenu(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${
                          viewPaneMode === 'right' ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <PanelRight className="w-4 h-4 text-orange-500" />
                          Right Split Pane
                        </span>
                        {viewPaneMode === 'right' && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => { setViewPaneMode('bottom'); setShowViewMenu(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${
                          viewPaneMode === 'bottom' ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <PanelBottom className="w-4 h-4 text-orange-500" />
                          Bottom Split Pane
                        </span>
                        {viewPaneMode === 'bottom' && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => { setViewPaneMode('off'); setShowViewMenu(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${
                          viewPaneMode === 'off' ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Maximize2 className="w-4 h-4 text-orange-500" />
                          Hide Pane (Full List)
                        </span>
                        {viewPaneMode === 'off' && <Check className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100 dark:bg-slate-900 my-1" />

                  <div>
                    <p className="px-3 py-1 text-[10px] font-extrabold font-mono text-slate-400 uppercase tracking-widest">
                      List Density
                    </p>
                    <div className="space-y-1 mt-1">
                      <button
                        onClick={() => { setDensityMode('comfortable'); setShowViewMenu(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${
                          densityMode === 'comfortable' ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                        }`}
                      >
                        <span>Comfortable (Snippets)</span>
                        {densityMode === 'comfortable' && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => { setDensityMode('compact'); setShowViewMenu(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${
                          densityMode === 'compact' ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                        }`}
                      >
                        <span>Compact (High Density)</span>
                        {densityMode === 'compact' && <Check className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => fetchMessages(true)}
            className={`p-2.5 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-slate-500 hover:text-orange-500 hover:border-orange-400 transition cursor-pointer shadow-2xs ${selectedMessage ? 'hidden sm:block' : 'block'}`}
            title="Sync Mail"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          </button>

          <button
            id="tour-mailbox-compose"
            onClick={() => { setComposeData({ to: '', subject: '', content: '' }); setComposeAttachments([]); setShowCompose(true); }}
            className={`flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-2xl text-xs font-extrabold shadow-sm shadow-orange-500/20 transition-all cursor-pointer whitespace-nowrap active:scale-95 ${selectedMessage ? 'hidden sm:flex' : 'flex'}`}
          >
            <PenSquare className="w-4 h-4" />
            <span>Compose</span>
          </button>

          {!selectedMessage && (
            <button
              onClick={() => setShowSearch(v => !v)}
              className="md:hidden p-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile search */}
      {showSearch && (
        <div className="md:hidden shrink-0 px-4 py-2.5 border-b border-slate-200/80 bg-white dark:bg-slate-950">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none focus:border-orange-500"
            />
          </div>
        </div>
      )}

      {/* Mobile Folder Tabs */}
      {!selectedMessage && (
        <div className="lg:hidden shrink-0 bg-slate-50/50 dark:bg-slate-900/40 p-2 border-b border-slate-200/80 dark:border-slate-800 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="inline-flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 min-w-full">
            {folders.map((folder) => {
              const isActive = selectedFolder === folder.id;
              const Icon = folder.icon;
              return (
                <button
                  key={folder.id}
                  onClick={() => { setSelectedFolder(folder.id); setSelectedMessage(null); setSelectedLabel(null); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                    isActive ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-2xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{folder.label}</span>
                  {folder.id === 'INBOX' && unreadCount > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono font-extrabold leading-none ${isActive ? 'bg-white text-orange-600' : 'bg-orange-500 text-white'}`}>
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Body Container */}
      <div className={`flex flex-1 min-h-0 overflow-hidden ${viewPaneMode === 'bottom' ? 'flex-col lg:flex-row' : 'flex-row'}`}>

        {/* Desktop Sidebar */}
        <div id="tour-mailbox-folders" className="hidden lg:flex w-60 border-r border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex-col p-4 gap-1.5 shrink-0">
          <div className="px-2 pb-1.5">
            <p className="text-[10px] font-extrabold font-mono text-slate-400 uppercase tracking-widest">Mailboxes</p>
          </div>

          {folders.map((folder) => {
            const Icon = folder.icon;
            const isActive = selectedFolder === folder.id;
            return (
              <button
                key={folder.id}
                onClick={() => { setSelectedFolder(folder.id); setSelectedMessage(null); setSelectedLabel(null); }}
                className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-slate-950 text-orange-600 dark:text-orange-400 shadow-2xs border border-slate-200/80 dark:border-slate-800'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-slate-900/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-orange-500' : 'text-slate-400'}`} />
                  {folder.label}
                </div>
                {folder.id === 'INBOX' && unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 bg-orange-500 text-white rounded-full text-[10px] font-mono font-extrabold shadow-2xs">{unreadCount}</span>
                )}
              </button>
            );
          })}

          <div className="mt-6 px-2">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-extrabold font-mono text-slate-400 uppercase tracking-widest">Smart Labels</p>
              <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{MAIL_LABELS.length}</span>
            </div>
            <div className="space-y-2">
              {MAIL_LABELS.map(l => {
                const isActive = selectedLabel === l.label;
                const count = getLabelCount(l.label);
                return (
                  <button
                    key={l.label}
                    onClick={() => { setSelectedLabel(isActive ? null : l.label); setSelectedMessage(null); }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer border ${
                      isActive
                        ? `${l.bgSoft} ${l.text} border-orange-300 dark:border-orange-800 shadow-2xs`
                        : 'bg-white/60 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 border-slate-200/70 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-950'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${l.color} shrink-0 shadow-2xs ring-2 ring-white dark:ring-slate-900`} />
                      <span>{l.label}</span>
                    </div>
                    {count > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold ${
                        isActive
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content Workspace (Split or Full) */}
        <div className={`flex-1 flex min-w-0 overflow-hidden ${viewPaneMode === 'bottom' ? 'flex-col' : 'flex-row'}`}>

          {/* Message Thread List Container */}
          <div className={`flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-950 ${
            viewPaneMode === 'bottom'
              ? 'h-1/2 border-b border-slate-200/80 dark:border-slate-800'
              : selectedMessage && viewPaneMode === 'right'
              ? 'hidden lg:flex'
              : 'flex'
          }`}>
            {selectedLabel && (
              <div className="shrink-0 flex items-center gap-2 px-4 py-2.5 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
                <span className="text-xs font-bold text-slate-400">Filtered by label:</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border border-slate-200/60 dark:border-slate-800 ${MAIL_LABELS.find(l => l.label === selectedLabel)?.bgSoft} ${MAIL_LABELS.find(l => l.label === selectedLabel)?.text}`}>
                  <div className={`w-2 h-2 rounded-full ${MAIL_LABELS.find(l => l.label === selectedLabel)?.color}`} />
                  {selectedLabel}
                </span>
                <button
                  onClick={() => setSelectedLabel(null)}
                  className="ml-auto p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                  <p className="text-xs font-bold text-slate-400">Loading messages...</p>
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center text-white shadow-2xs">
                    <InboxIcon className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
                    No messages in {selectedFolder.toLowerCase()}{selectedLabel ? ` labeled "${selectedLabel}"` : ''}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-900">
                  {filteredMessages.map((msg) => (
                    <div
                      key={msg.id}
                      onClick={() => handleMessageClick(msg)}
                      className={`group flex items-center gap-3.5 ${densityMode === 'compact' ? 'px-4 py-2.5' : 'px-5 py-4'} cursor-pointer transition-colors border-l-4 ${
                        selectedMessage?.id === msg.id
                          ? 'bg-orange-50/50 dark:bg-orange-950/20 border-l-orange-500'
                          : 'hover:bg-slate-50/80 dark:hover:bg-slate-900/60 border-l-transparent'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 text-xs font-mono font-extrabold transition-transform group-hover:scale-105 ${
                        msg.status === 'UNREAD' 
                          ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-2xs' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700'
                      }`}>
                        {(selectedFolder === 'SENT' ? msg.to : msg.from).charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <p className={`text-xs sm:text-sm truncate ${msg.status === 'UNREAD' ? 'font-extrabold text-slate-900 dark:text-white' : 'font-bold text-slate-700 dark:text-slate-300'}`}>
                            {selectedFolder === 'SENT'
                              ? (msg.to.split('<')[0].trim() || msg.to)
                              : (msg.from.split('<')[0].trim() || msg.from)}
                          </p>
                          <span className="text-[10px] font-mono font-extrabold text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-200/60 dark:border-slate-800 shrink-0">
                            {new Date(msg.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className={`text-xs truncate ${densityMode === 'comfortable' ? 'mb-0.5' : ''} ${msg.status === 'UNREAD' ? 'font-extrabold text-slate-900 dark:text-white' : 'font-bold text-slate-500 dark:text-slate-400'}`}>
                          {msg.subject}
                        </p>
                        {densityMode === 'comfortable' && (
                          <p className="text-[11px] font-bold text-slate-400 truncate">
                            {msg.body.substring(0, 80)}...
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {msg.label && (
                          <div
                            className={`w-2 h-2 rounded-full shrink-0 shadow-2xs ${MAIL_LABELS.find(l => l.label === msg.label)?.color || 'bg-slate-300'}`}
                            title={msg.label}
                          />
                        )}
                        {msg.status === 'UNREAD' && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full shadow-2xs" />
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

          {/* Message Detail (Right or Bottom Split) */}
          {viewPaneMode !== 'off' && (
            selectedMessage ? (
              <div className={`flex-1 flex flex-col bg-white dark:bg-slate-950 overflow-hidden ${
                viewPaneMode === 'bottom'
                  ? 'h-1/2 border-t border-slate-200/80 dark:border-slate-800'
                  : 'lg:flex-[1.8] border-l border-slate-200/80 dark:border-slate-800'
              }`}>
                {/* Detail header */}
                <div className="shrink-0 border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-5 py-3 flex items-center justify-between gap-2 sm:gap-3 bg-slate-50/70 dark:bg-slate-900/60">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateMessage(selectedMessage.id, { status: selectedMessage.status === 'FLAGGED' ? 'READ' : 'FLAGGED' })}
                      className="p-2.5 bg-white dark:bg-slate-950 hover:bg-amber-50 rounded-2xl text-slate-400 hover:text-amber-500 border border-slate-200/80 dark:border-slate-800 transition-colors cursor-pointer shadow-2xs"
                      title={selectedMessage.status === 'FLAGGED' ? 'Unstar' : 'Star'}
                    >
                      <Star className={`w-4 h-4 ${selectedMessage.status === 'FLAGGED' ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>
                    <button
                      onClick={() => { updateMessage(selectedMessage.id, { folder: 'TRASH' }); setSelectedMessage(null); }}
                      className="p-2.5 bg-white dark:bg-slate-950 hover:bg-rose-50 rounded-2xl text-slate-400 hover:text-rose-500 border border-slate-200/80 dark:border-slate-800 transition-colors cursor-pointer shadow-2xs"
                      title="Move to Trash"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setShowLabelMenu(v => !v)}
                        className={`p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 transition-colors cursor-pointer shadow-2xs ${
                          selectedMessage.label
                            ? `${MAIL_LABELS.find(l => l.label === selectedMessage.label)?.bgSoft} ${MAIL_LABELS.find(l => l.label === selectedMessage.label)?.text}`
                            : 'bg-white dark:bg-slate-950 text-slate-400 hover:bg-slate-100'
                        }`}
                        title="Add label"
                      >
                        <Tag className="w-4 h-4" />
                      </button>
                      {showLabelMenu && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setShowLabelMenu(false)} />
                          <div className="absolute left-0 top-11 z-20 w-44 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden p-1">
                            <button
                              onClick={() => { updateMessage(selectedMessage.id, { label: null }); setShowLabelMenu(false); }}
                              className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-colors cursor-pointer"
                            >
                              No label
                              {!selectedMessage.label && <Check className="w-3.5 h-3.5" />}
                            </button>
                            {MAIL_LABELS.map(l => (
                              <button
                                key={l.label}
                                onClick={() => { updateMessage(selectedMessage.id, { label: l.label }); setShowLabelMenu(false); }}
                                className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-extrabold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-colors cursor-pointer"
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
                        className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-extrabold rounded-2xl transition-all cursor-pointer shadow-2xs active:scale-95"
                      >
                        <Reply className="w-4 h-4" /> Reply
                      </button>
                    )}
                    <button
                      onClick={handleForward}
                      className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-extrabold rounded-2xl transition-colors cursor-pointer shadow-2xs"
                    >
                      <Forward className="w-4 h-4" /> Forward
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setShowMessageMenu(v => !v)}
                        className="p-2.5 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-2xl text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shadow-2xs"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {showMessageMenu && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setShowMessageMenu(false)} />
                          <div className="absolute right-0 top-11 z-20 w-48 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden py-1 p-1">
                            {selectedFolder !== 'SENT' && (
                              <button
                                onClick={() => { handleReply(); setShowMessageMenu(false); }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-extrabold text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded-xl transition-colors cursor-pointer"
                              >
                                <Reply className="w-4 h-4 text-orange-500" /> Reply to Sender
                              </button>
                            )}
                            <button
                              onClick={() => { handleForward(); setShowMessageMenu(false); }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-extrabold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-colors cursor-pointer"
                            >
                              <Forward className="w-4 h-4 text-slate-400" /> Forward Message
                            </button>
                            <div className="h-px bg-slate-100 dark:bg-slate-900 my-1" />
                            <button
                              onClick={handleMoveToSpam}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-extrabold text-amber-600 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                            >
                              <SpamIcon className="w-4 h-4" /> Mark as Spam
                            </button>
                            <button
                              onClick={() => { updateMessage(selectedMessage!.id, { folder: 'TRASH' }); setSelectedMessage(null); setShowMessageMenu(false); }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-extrabold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
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
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 sm:py-6 pb-36 lg:pb-8 space-y-5 sm:space-y-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
                    {selectedMessage.subject}
                  </h2>

                  <div className="flex items-center gap-3.5 p-4 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
                    <div className="w-11 h-11 bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center text-white text-base font-mono font-extrabold shrink-0 shadow-2xs">
                      {selectedMessage.from.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                          {selectedMessage.from.split('<')[0].trim()}
                        </p>
                        <span className="text-[11px] font-mono font-bold text-slate-400 shrink-0">
                          {new Date(selectedMessage.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs font-mono font-bold text-orange-500 truncate mt-0.5">
                        {selectedMessage.from.match(/<([^>]+)>/)?.[1] || selectedMessage.from}
                      </p>
                    </div>
                  </div>

                  {/* Unified Context: 360° client snapshot */}
                  {contextLoading ? (
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-xs py-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" /> Loading client context…
                    </div>
                  ) : clientContext?.contact ? (
                    <div className="p-5 bg-orange-50/50 dark:bg-orange-950/20 rounded-3xl border border-orange-200/60 dark:border-orange-900/40 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-extrabold text-slate-900 dark:text-white">{clientContext.contact.name}</p>
                          {clientContext.contact.company && (
                            <p className="text-xs font-bold text-slate-400">{clientContext.contact.company}</p>
                          )}
                        </div>
                        <span className="text-[9px] font-extrabold uppercase tracking-wider px-3 py-1 bg-white dark:bg-slate-950 rounded-full border border-orange-200/60 text-orange-600 dark:text-orange-400">
                          {clientContext.contact.pipelineStage.replace('_', ' ')}
                        </span>
                      </div>

                      {clientContext.invoices.length > 0 && (
                        <div>
                          <p className="text-[10px] font-extrabold font-mono text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <Receipt className="w-3.5 h-3.5 text-orange-500" /> Recent Invoices
                          </p>
                          <div className="space-y-1.5">
                            {clientContext.invoices.map(inv => (
                              <div key={inv.id} className="flex items-center justify-between text-xs bg-white dark:bg-slate-950 rounded-2xl px-3 py-2 border border-slate-200/80 dark:border-slate-800">
                                <span className="font-mono font-extrabold text-slate-900 dark:text-white">{inv.number}</span>
                                <span className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-slate-500 dark:text-slate-400">${inv.amount.toFixed(2)}</span>
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                                    inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' :
                                    inv.status === 'OVERDUE' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400' :
                                    'bg-yellow-50 text-amber-700 dark:bg-yellow-950/40 dark:text-yellow-400'
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
                          <p className="text-[10px] font-extrabold font-mono text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <LifeBuoy className="w-3.5 h-3.5 text-orange-500" /> Recent Tickets
                          </p>
                          <div className="space-y-1.5">
                            {clientContext.tickets.map(t => (
                              <div key={t.id} className="flex items-center justify-between text-xs bg-white dark:bg-slate-950 rounded-2xl px-3 py-2 border border-slate-200/80 dark:border-slate-800">
                                <span className="font-extrabold text-slate-900 dark:text-white truncate">{t.subject}</span>
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 shrink-0">
                                  {t.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <Link href="/dashboard/crm" className="text-xs font-extrabold text-orange-500 hover:text-orange-600 inline-block">
                        View in CRM →
                      </Link>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-400">No CRM record for this sender</p>
                      <Link
                        href="/dashboard/crm"
                        className="flex items-center gap-1.5 text-xs font-extrabold text-orange-500 hover:text-orange-600"
                      >
                        <UserPlus className="w-4 h-4" /> Create Contact
                      </Link>
                    </div>
                  )}

                  <div className="bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal shadow-2xs overflow-hidden">
                    {selectedMessage.html ? (
                      <div className="prose max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedMessage.html) }} />
                    ) : (
                      <pre className="whitespace-pre-wrap font-sans text-sm">
                        {selectedMessage.body}
                      </pre>
                    )}
                  </div>

                  {selectedMessage.hasAttachments && selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                    <div className="pt-5 border-t border-slate-200/80 dark:border-slate-800">
                      <p className="text-[10px] font-extrabold font-mono text-slate-400 uppercase tracking-widest mb-3">
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
                            <div key={i} className="flex items-center gap-3 p-3.5 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-orange-400 transition-all shadow-xs">
                              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-500 flex items-center justify-center shrink-0">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{att.filename}</p>
                                <p className="text-[10px] font-mono font-bold text-slate-400">
                                  {[sizeLabel, ext].filter(Boolean).join(' · ')}
                                </p>
                              </div>
                              <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile sticky footer */}
                <div className="lg:hidden fixed bottom-20 sm:bottom-24 left-0 right-0 z-40 px-4 pb-safe pointer-events-none">
                  <div className="max-w-lg mx-auto flex items-center gap-2 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl p-2 pointer-events-auto">
                    <button
                      onClick={() => setSelectedMessage(null)}
                      className="px-3.5 py-3 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-extrabold rounded-2xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                      title="Close email and return to inbox"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Close</span>
                    </button>
                    {selectedFolder !== 'SENT' && (
                      <button
                        onClick={handleReply}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-extrabold rounded-2xl transition-all cursor-pointer active:scale-95 shadow-md shadow-orange-500/25"
                      >
                        <Reply className="w-4 h-4" /> Reply
                      </button>
                    )}
                    <button
                      onClick={handleForward}
                      className="p-3 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl transition-colors cursor-pointer shrink-0"
                      title="Forward"
                    >
                      <Forward className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { updateMessage(selectedMessage.id, { folder: 'TRASH' }); setSelectedMessage(null); }}
                      className="p-3 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-500 rounded-2xl border border-rose-100 dark:border-rose-900/40 transition-colors cursor-pointer shrink-0"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Desktop empty state */
              <div className="hidden lg:flex flex-[1.8] items-center justify-center bg-slate-50/30 dark:bg-slate-950/40 border-l border-slate-200/80 dark:border-slate-800">
                <div className="text-center space-y-4 max-w-xs p-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-600 rounded-3xl flex items-center justify-center mx-auto text-white shadow-2xs">
                    <Mail className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">No message selected</h3>
                    <p className="text-xs font-bold text-slate-400">Choose a message from your inbox to view full email thread details.</p>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Slide-over Full Reader Modal when Pane Mode is OFF */}
      {viewPaneMode === 'off' && selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col h-[90vh] overflow-hidden">
            <div className="shrink-0 border-b border-slate-200/80 dark:border-slate-800 px-6 py-4 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/60">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 dark:bg-orange-950/60 text-orange-500 rounded-xl">
                  <Mail className="w-4 h-4" />
                </div>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white truncate max-w-md">{selectedMessage.subject}</p>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center text-white text-base font-mono font-extrabold shrink-0 shadow-2xs">
                    {selectedMessage.from.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white">{selectedMessage.from}</p>
                    <p className="text-xs font-mono text-orange-500">To: {selectedMessage.to}</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-extrabold text-slate-400 bg-white dark:bg-slate-950 px-3 py-1 rounded-full border border-slate-200/80 dark:border-slate-800">
                  {new Date(selectedMessage.date).toLocaleDateString()}
                </span>
              </div>
              <div className="bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal shadow-2xs">
                {selectedMessage.html ? (
                  <div className="prose max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedMessage.html) }} />
                ) : (
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {selectedMessage.body}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sent success toast */}
      {sendToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-5 py-3.5 bg-emerald-600 text-white rounded-2xl shadow-xl text-sm font-semibold animate-in slide-in-from-bottom-4 duration-300">
          <SendActionIcon className="w-4 h-4" />
          Email sent successfully!
        </div>
      )}

      {/* ── Compose Modal ── */}
      {showCompose && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={() => setShowCompose(false)}
          />
          <div className="relative z-10 w-full sm:max-w-xl bg-white dark:bg-slate-950 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col h-[92dvh] sm:h-auto sm:max-h-[88dvh] overflow-hidden border border-slate-200/80 dark:border-slate-800">

            {/* Handle */}
            <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>

            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/70 dark:bg-slate-900/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-50 dark:bg-orange-950/60 text-orange-500 rounded-2xl border border-orange-200/60 dark:border-orange-900/40">
                  <PenSquare className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">New Message</h3>
                  <p className="text-xs font-bold text-slate-400">Compose an email</p>
                </div>
              </div>
              <button
                onClick={() => { setShowCompose(false); setComposeAttachments([]); }}
                className="p-2 rounded-xl hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors cursor-pointer text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSend} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 pb-8 space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <div>
                  <label className="block text-[10px] font-extrabold font-mono uppercase tracking-widest text-slate-400 mb-1.5">To *</label>
                  <input
                    type="email"
                    required
                    value={composeData.to}
                    onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl focus:border-orange-500 focus:bg-white dark:focus:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all"
                    placeholder="recipient@example.com"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold font-mono uppercase tracking-widest text-slate-400 mb-1.5">Subject *</label>
                  <input
                    type="text"
                    required
                    value={composeData.subject}
                    onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl focus:border-orange-500 focus:bg-white dark:focus:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all"
                    placeholder="Email subject..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold font-mono uppercase tracking-widest text-slate-400 mb-1.5">Message *</label>
                  <textarea
                    required
                    value={composeData.content}
                    onChange={(e) => setComposeData({ ...composeData, content: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl focus:border-orange-500 focus:bg-white dark:focus:bg-slate-950 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all resize-none min-h-[140px] sm:min-h-[200px]"
                    placeholder="Write your message..."
                  />
                </div>

                {/* Send Error */}
                {sendError && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40 rounded-2xl text-xs text-rose-600 dark:text-rose-400 font-extrabold">
                    <X className="w-4 h-4 shrink-0 text-rose-500" />
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
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-extrabold text-slate-500 dark:text-slate-400 hover:border-orange-500 hover:text-orange-600 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {uploadingFile
                        ? <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                        : <Paperclip className="w-4 h-4 text-orange-500" />}
                      {uploadingFile ? 'Uploading...' : 'Attach files'}
                    </button>
                    <button
                      type="submit"
                      disabled={sending}
                      className="flex-[2] py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-extrabold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 shadow-xs active:scale-95"
                    >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendActionIcon className="w-4 h-4" />}
                      {sending ? 'Sending...' : 'Send Message'}
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
                          <div key={i} className="flex items-center gap-2 px-3 py-2 bg-orange-50 dark:bg-orange-950/40 border border-orange-200/60 dark:border-orange-900/40 rounded-xl">
                            {isImage
                              ? <ImageIcon className="w-4 h-4 text-orange-500 shrink-0" />
                              : <FileText className="w-4 h-4 text-orange-500 shrink-0" />}
                            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex-1 truncate">{att.filename}</span>
                            <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0">{sizeLabel}</span>
                            <button
                              type="button"
                              onClick={() => setComposeAttachments(prev => prev.filter((_, j) => j !== i))}
                              className="p-1 hover:bg-orange-200 dark:hover:bg-orange-900 rounded-lg transition-colors cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5 text-slate-500" />
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
