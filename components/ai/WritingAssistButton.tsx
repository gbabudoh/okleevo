"use client";

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Loader2, Wand2, Briefcase, Smile, Scissors, Maximize2, AlignLeft } from 'lucide-react';

type AssistAction = 'improve' | 'professional' | 'friendly' | 'shorten' | 'expand' | 'summarize';

const ACTIONS: { id: AssistAction; label: string; icon: typeof Wand2 }[] = [
  { id: 'improve', label: 'Improve writing', icon: Wand2 },
  { id: 'professional', label: 'Make professional', icon: Briefcase },
  { id: 'friendly', label: 'Make friendly', icon: Smile },
  { id: 'shorten', label: 'Shorten', icon: Scissors },
  { id: 'expand', label: 'Expand', icon: Maximize2 },
  { id: 'summarize', label: 'Summarize', icon: AlignLeft },
];

interface WritingAssistButtonProps {
  text: string;
  onResult: (result: string) => void;
  className?: string;
}

export default function WritingAssistButton({ text, onResult, className = '' }: WritingAssistButtonProps) {
  const [open, setOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState<AssistAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const runAction = async (action: AssistAction) => {
    if (!text.trim() || loadingAction) return;
    setLoadingAction(action);
    setError(null);
    try {
      const res = await fetch('/api/ai/writing-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get suggestion');
      onResult(data.result);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        disabled={!text.trim()}
        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loadingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
        AI Assist
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-30 w-48 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {ACTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => runAction(id)}
              disabled={!!loadingAction}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingAction === id ? <Loader2 className="w-4 h-4 animate-spin text-indigo-600" /> : <Icon className="w-4 h-4 text-gray-400" />}
              {label}
            </button>
          ))}
          {error && (
            <p className="px-3.5 py-2 text-xs text-red-600 bg-red-50 border-t border-red-100">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
