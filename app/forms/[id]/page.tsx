"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Send, CheckCircle2, AlertCircle, Loader2, 
  ArrowLeft, FileText, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date';
  required: boolean;
  placeholder?: string;
  options?: string[];
}

interface Form {
  id: string;
  name: string;
  description?: string;
  fieldList: FormField[];
  status: string;
  category: string;
}

export default function PublicFormPage() {
  const { id } = useParams();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string | number | boolean>>({});

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await fetch(`/api/public/forms/${id}`);
        if (!res.ok) throw new Error('Form not found or inactive');
        const data = await res.json() as Form;
        setForm(data);
        
        // Initialize form data
        const initialData: Record<string, string | number | boolean> = {};
        data.fieldList.forEach((field: FormField) => {
          initialData[field.id] = field.type === 'checkbox' ? false : '';
        });
        setFormData(initialData);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/public/forms/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to submit form');
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
          <p className="text-slate-500 font-medium animate-pulse">Preparing your form...</p>
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-red-100 text-center space-y-6">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">Oops! Something went wrong</h1>
            <p className="text-slate-500">{error || "The form you're looking for doesn't exist."}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl p-10 shadow-2xl border border-emerald-100 text-center space-y-8"
        >
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-black text-slate-900">Submission Received!</h1>
            <p className="text-slate-500 font-medium">Thank you for your response. Your data has been securely processed.</p>
          </div>
          <div className="pt-4">
            <button 
              onClick={() => setSubmitted(false)}
              className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" /> Send Another
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 selection:bg-indigo-100">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200/30 blur-[120px]" />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Branding Header */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900">OKLEEVO<span className="text-indigo-600">.</span></span>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white p-8 md:p-12"
        >
          <header className="mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest border border-indigo-100/50">
              <FileText className="w-3.5 h-3.5" /> {form.category} Form
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {form.name}
            </h1>
            {form.description && (
              <p className="text-lg text-slate-500 font-medium leading-relaxed">
                {form.description}
              </p>
            )}
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              {form.fieldList.map((field) => (
                <div key={field.id} className="group">
                  <label className="block text-sm font-bold text-slate-700 mb-2.5 transition-colors group-focus-within:text-indigo-600">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  
                  {field.type === 'textarea' ? (
                    <textarea
                      required={field.required}
                      placeholder={field.placeholder}
                      value={formData[field.id] as string || ''}
                      onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all h-32 resize-none font-medium text-slate-900"
                    />
                  ) : field.type === 'select' ? (
                    <select
                      required={field.required}
                      value={formData[field.id] as string || ''}
                      onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all cursor-pointer font-medium text-slate-900 appearance-none"
                    >
                      <option value="">Select an option</option>
                      {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : field.type === 'checkbox' ? (
                    <div className="flex items-center gap-3 py-2">
                      <input
                        type="checkbox"
                        id={field.id}
                        checked={formData[field.id] as boolean || false}
                        onChange={(e) => setFormData({ ...formData, [field.id]: e.target.checked })}
                        className="w-6 h-6 rounded-lg text-indigo-600 focus:ring-indigo-500 border-2 border-slate-200 cursor-pointer"
                      />
                      <label htmlFor={field.id} className="text-slate-600 font-medium cursor-pointer">
                        I agree to the terms and conditions
                      </label>
                    </div>
                  ) : (
                    <input
                      type={field.type}
                      required={field.required}
                      placeholder={field.placeholder}
                      value={formData[field.id] as string || ''}
                      onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-5 bg-indigo-600 text-white rounded-[1.25rem] font-bold text-lg shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Submit Response
                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          <footer className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-400 text-sm font-medium flex items-center justify-center gap-1">
              Powered by <span className="font-bold text-slate-600">OKLEEVO</span>
            </p>
          </footer>
        </motion.div>
      </div>
    </div>
  );
}
