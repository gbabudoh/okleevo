"use client";

import { useState, useEffect } from 'react';
import { 
  Mail, Trash2, AlertCircle, 
  Search, RefreshCw, Star, 
  MoreVertical, Reply, Paperclip,
  ChevronLeft, Loader2,
  Inbox as InboxIcon, Send as SendIcon, 
  Trash as TrashIcon, AlertTriangle as SpamIcon,
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

  const fetchMessages = async (forceSync = false) => {
    if (forceSync) setSyncing(true);
    try {
      const res = await fetch('/api/email/inbox');
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Failed to fetch mail:', err);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const filteredMessages = messages
    .filter(m => m.folder === selectedFolder)
    .filter(m => 
      m.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.from.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const folders = [
    { id: 'INBOX', label: 'Inbox', icon: InboxIcon, color: 'text-blue-500' },
    { id: 'SENT', label: 'Sent', icon: SendIcon, color: 'text-emerald-500' },
    { id: 'SPAM', label: 'Spam', icon: SpamIcon, color: 'text-amber-500' },
    { id: 'TRASH', label: 'Trash', icon: TrashIcon, color: 'text-rose-500' },
  ] as const;

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
      
      {/* ── Top Bar ── */}
      <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white/50 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Business Mailbox</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">v2.0 Direct SMTP/IMAP</p>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-12 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2 bg-gray-50 border border-transparent focus:border-indigo-100 focus:bg-white rounded-xl outline-none font-medium text-sm transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => fetchMessages(true)}
            disabled={syncing}
            className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
          <div className="h-8 w-px bg-gray-100 mx-2" />
          <button className="px-5 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-all shadow-lg hover:shadow-indigo-200">
            Compose
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* ── Sidebar ── */}
        <div className="w-64 border-r border-gray-100 bg-gray-50/30 p-4 flex flex-col gap-1 shrink-0">
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => { setSelectedFolder(folder.id); setSelectedMessage(null); }}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
                selectedFolder === folder.id 
                ? 'bg-white text-indigo-600 shadow-md shadow-indigo-100/50' 
                : 'text-gray-500 hover:bg-white/50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <folder.icon className={`w-4 h-4 ${selectedFolder === folder.id ? folder.color : 'text-gray-400'}`} />
                {folder.label}
              </div>
              {folder.id === 'INBOX' && messages.filter(m => m.status === 'UNREAD').length > 0 && (
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-lg text-[10px] font-black">
                  {messages.filter(m => m.status === 'UNREAD').length}
                </span>
              )}
            </button>
          ))}
          
          <div className="mt-8 px-4">
             <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-4">Labels</p>
             <div className="space-y-3">
               <div className="flex items-center gap-3 text-xs font-bold text-gray-500 hover:text-gray-900 cursor-pointer group">
                 <div className="w-2 h-2 rounded-full bg-pink-500" />
                 Marketing
               </div>
               <div className="flex items-center gap-3 text-xs font-bold text-gray-500 hover:text-gray-900 cursor-pointer group">
                 <div className="w-2 h-2 rounded-full bg-blue-500" />
                 Clients
               </div>
               <div className="flex items-center gap-3 text-xs font-bold text-gray-500 hover:text-gray-900 cursor-pointer group">
                 <div className="w-2 h-2 rounded-full bg-amber-500" />
                 Priority
               </div>
             </div>
          </div>
        </div>

        {/* ── Message List ── */}
        <div className={`flex-1 flex flex-col min-w-0 ${selectedMessage ? 'hidden lg:flex' : 'flex'}`}>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Fetching your mailbox…</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 opacity-40">
                <InboxIcon className="w-16 h-16 text-gray-300" />
                <p className="text-gray-400 font-bold">Your {selectedFolder.toLowerCase()} is empty</p>
              </div>
            ) : (
              filteredMessages.map((msg) => (
                <div 
                  key={msg.id}
                  onClick={() => setSelectedMessage(msg)}
                  className={`group relative flex items-center gap-4 px-6 py-4 cursor-pointer transition-all hover:bg-gray-50 ${
                    selectedMessage?.id === msg.id ? 'bg-indigo-50/50' : ''
                  } ${msg.status === 'UNREAD' ? 'bg-white' : 'bg-gray-50/30 opacity-70'}`}
                >
                  {msg.status === 'UNREAD' && (
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                  )}
                  
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <span className="text-indigo-600 font-black text-xs">
                      {msg.from.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`text-sm truncate ${msg.status === 'UNREAD' ? 'font-black text-gray-900' : 'font-bold text-gray-500'}`}>
                        {msg.from.split('<')[0] || msg.from}
                      </h4>
                      <span className="text-[10px] font-bold text-gray-400 shrink-0">
                        {new Date(msg.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${msg.status === 'UNREAD' ? 'font-bold text-gray-700' : 'font-medium text-gray-400'}`}>
                      {msg.subject}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {msg.body.substring(0, 100)}...
                    </p>
                  </div>
                  
                  {msg.hasAttachments && (
                    <Paperclip className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-400" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Message Detail ── */}
        {selectedMessage ? (
          <div className="flex-[1.5] border-l border-gray-100 flex flex-col bg-white">
            <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setSelectedMessage(null)}
                  className="lg:hidden p-2 text-gray-400 hover:bg-gray-100 rounded-xl mr-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1">
                  <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer"><Star className="w-5 h-5" /></button>
                  <button className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"><Trash2 className="w-5 h-5" /></button>
                  <button className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all cursor-pointer"><AlertCircle className="w-5 h-5" /></button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
                  <Reply className="w-3.5 h-3.5" />
                  Reply
                </button>
                <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl"><MoreVertical className="w-5 h-5" /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xl font-black">
                    {selectedMessage.from.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900 leading-tight mb-1">{selectedMessage.subject}</h2>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-700">{selectedMessage.from}</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(selectedMessage.date).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="prose prose-sm max-w-none text-gray-700 font-medium leading-relaxed">
                {selectedMessage.html ? (
                  <div dangerouslySetInnerHTML={{ __html: selectedMessage.html }} />
                ) : (
                  <pre className="whitespace-pre-wrap font-sans text-sm">{selectedMessage.body}</pre>
                )}
              </div>

              {selectedMessage.hasAttachments && (
                <div className="mt-12 pt-8 border-t border-gray-100">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Attachments</p>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:border-indigo-100 transition-all cursor-pointer group">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <Paperclip className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">proposal.pdf</p>
                        <p className="text-[10px] text-gray-400 font-bold">1.2 MB</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex flex-[1.5] border-l border-gray-100 items-center justify-center bg-gray-50/20">
             <div className="text-center space-y-4 max-w-sm">
               <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                 <Mail className="w-10 h-10 text-indigo-300" />
               </div>
               <h3 className="text-xl font-black text-gray-900">Select a message</h3>
               <p className="text-gray-400 font-medium text-sm px-8">
                 Choose a conversation from the list on the left to read and respond.
               </p>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
