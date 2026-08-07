"use client";

import React, { useState } from 'react';
import { Trash2, X, AlertCircle } from 'lucide-react';

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

  const handleConfirm = () => {
    if (confirmText === 'DELETE') {
      onConfirm();
      setConfirmText('');
      onClose();
    } else {
      alert('⚠️ Please type DELETE to confirm');
    }
  };

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center z-[150] p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 px-6 py-5 flex items-center gap-3">
          <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl text-white shadow-xs">
            <Trash2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{title}</h2>
            <p className="text-red-100/90 text-xs font-medium mt-0.5">This action cannot be undone</p>
          </div>
          <button 
            type="button"
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors cursor-pointer text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Item Info */}
          <div className="bg-gradient-to-br from-rose-50/60 to-orange-50/60 dark:from-slate-800 dark:to-slate-800/80 border border-rose-200/80 dark:border-rose-900/40 rounded-2xl p-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white font-extrabold text-xl shadow-xs shrink-0">
                {itemName ? itemName.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white truncate">{itemName || 'Unknown Item'}</h3>
                {itemDetails && <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 truncate">{itemDetails}</p>}
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-amber-100 dark:bg-amber-900/60 rounded-xl shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-extrabold text-amber-900 dark:text-amber-300 uppercase tracking-wider mb-0.5">Warning</p>
                <p className="text-xs text-amber-800 dark:text-amber-200/90 leading-relaxed">
                  Are you sure you want to delete <span className="font-bold">{itemName}</span>? {warningMessage}
                </p>
              </div>
            </div>
          </div>

          {/* Confirmation Text */}
          <div className="text-center pt-1">
            <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">
              Type <span className="font-extrabold text-gray-900 dark:text-white">DELETE</span> to confirm
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="mt-2 w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-center font-bold text-gray-900 dark:text-white text-sm outline-none transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleConfirm();
                }
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-slate-900/60 border-t border-gray-100 dark:border-slate-800 px-6 py-4 flex gap-3">
          <button 
            type="button"
            onClick={handleClose}
            className="flex-1 px-5 py-3 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-sm"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleConfirm}
            className="flex-1 px-5 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-extrabold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
