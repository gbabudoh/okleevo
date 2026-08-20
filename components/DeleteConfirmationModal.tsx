"use client";

import React, { useState } from 'react';
import { Trash2, X, AlertTriangle } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
  itemDetails?: string;
  warningMessage?: string;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  itemDetails,
  warningMessage = "This action cannot be undone and will permanently remove all associated data."
}: DeleteConfirmationModalProps) {
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen) return null;

  const isDeleteConfirmed = confirmText.trim().toUpperCase() === 'DELETE';

  const handleConfirm = () => {
    if (isDeleteConfirmed) {
      onConfirm();
      setConfirmText('');
      onClose();
    }
  };

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  // Sanitize item details string to remove 'undefined' or empty segments
  const sanitizedDetails = itemDetails
    ? itemDetails
        .split('·')
        .map(s => s.trim())
        .filter(s => s && s !== 'undefined' && s !== 'null')
        .join(' · ')
    : '';

  return (
    <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center z-[150] p-4 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-950 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Glassmorphic Security Header */}
        <div className="bg-rose-50/80 dark:bg-rose-950/60 border-b border-rose-100 dark:border-rose-900/40 px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="p-2.5 bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-200/60 dark:border-rose-800/60 shrink-0 shadow-2xs">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight truncate">{title}</h2>
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400 truncate mt-0.5">Irreversible Action Safeguard</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={handleClose}
            className="p-2 hover:bg-slate-200/80 dark:hover:bg-slate-800 rounded-2xl transition-all cursor-pointer text-slate-400 hover:text-slate-900 dark:hover:text-white shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 space-y-4">

          {/* Item Info Pod */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 flex items-center justify-center text-white font-mono font-extrabold text-sm shadow-2xs shrink-0">
                {itemName ? itemName.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">{itemName || 'Unknown Item'}</h3>
                {sanitizedDetails ? (
                  <p className="text-slate-400 font-mono font-bold text-xs mt-0.5 truncate">{sanitizedDetails}</p>
                ) : null}
              </div>
            </div>
          </div>

          {/* Amber Security Warning Pod */}
          <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-extrabold font-mono text-amber-800 dark:text-amber-300 uppercase tracking-widest mb-1">
                  IRREVERSIBLE DATA REMOVAL
                </p>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-bold leading-relaxed">
                  Are you sure you want to delete <span className="font-extrabold text-slate-900 dark:text-white">{itemName}</span>? {warningMessage}
                </p>
              </div>
            </div>
          </div>

          {/* Type-To-Confirm Input Box */}
          <div className="pt-1 space-y-2">
            <label className="block text-[10px] font-extrabold font-mono uppercase tracking-widest text-slate-400 text-center">
              Type <span className="text-slate-900 dark:text-white font-black">DELETE</span> to unlock confirmation
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border rounded-2xl text-center font-mono font-extrabold text-xs tracking-wider outline-none transition-all placeholder:text-slate-400 placeholder:font-sans ${
                isDeleteConfirmed
                  ? 'border-rose-500 ring-2 ring-rose-500/20 text-rose-600 dark:text-rose-400 bg-rose-50/30'
                  : 'border-slate-200 dark:border-slate-800 focus:border-orange-500 text-slate-900 dark:text-white'
              }`}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleConfirm();
                }
              }}
            />
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-200/80 dark:border-slate-800 px-6 py-4 flex gap-3">
          <button 
            type="button"
            onClick={handleClose}
            className="flex-1 px-5 py-3 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-extrabold rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleConfirm}
            disabled={!isDeleteConfirmed}
            className="flex-1 px-5 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold rounded-2xl shadow-sm shadow-rose-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
