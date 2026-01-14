import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

export default function StatusModal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'success' 
}: StatusModalProps) {
  if (!isOpen) return null;

  const config = {
    success: {
      icon: CheckCircle,
      bg: 'bg-emerald-100',
      text: 'text-emerald-600',
      button: 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/25',
      border: 'border-emerald-200'
    },
    error: {
      icon: AlertCircle,
      bg: 'bg-rose-100',
      text: 'text-rose-600',
      button: 'bg-gradient-to-r from-rose-500 to-red-600 shadow-rose-500/25',
      border: 'border-rose-200'
    },
    info: {
      icon: Info,
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      button: 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-blue-500/25',
      border: 'border-blue-200'
    }
  }[type];

  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-sm border border-white/50 overflow-hidden animate-in zoom-in-95 duration-200 p-6 text-center">
        <div className={`mx-auto w-16 h-16 rounded-full ${config.bg} flex items-center justify-center mb-4 shadow-inner`}>
          <Icon className={`w-8 h-8 ${config.text}`} />
        </div>
        
        <h3 className="text-xl font-black text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 font-medium mb-6">{message}</p>
        
        <button
          onClick={onClose}
          className={`w-full py-3.5 rounded-xl text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer ${config.button}`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
