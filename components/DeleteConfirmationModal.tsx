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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5 flex items-center gap-3">
          <div className="p-2 bg-white bg-opacity-20 rounded-lg">
            <Trash2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <p className="text-red-100 text-sm">This action cannot be undone</p>
          </div>
          <button 
            type="button"
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Item Info */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                {itemName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{itemName}</h3>
                {itemDetails && <p className="text-gray-600 text-sm mt-1">{itemDetails}</p>}
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900 mb-1">Warning</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Are you sure you want to delete <span className="font-bold">{itemName}</span>? {warningMessage}
                </p>
              </div>
            </div>
          </div>

          {/* Confirmation Text */}
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Type <span className="font-bold text-gray-900">DELETE</span> to confirm
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="mt-2 w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-center font-semibold"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleConfirm();
                }
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t-2 border-gray-200 px-6 py-4 flex gap-3">
          <button 
            type="button"
            onClick={handleClose}
            className="flex-1 px-6 py-3.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleConfirm}
            className="flex-1 px-6 py-3.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-5 h-5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
