"use client";

import React, { useState } from 'react';
import { FileEdit, Save, Sparkles, Trash2 } from 'lucide-react';

export function NoteEditor() {
  const [notes, setNotes] = useState([
    { id: '1', title: 'Meeting Notes', content: 'Discussed Q4 strategy...', date: '2024-12-05' },
    { id: '2', title: 'Project Ideas', content: 'New feature concepts...', date: '2024-12-04' },
  ]);
  const [activeNote, setActiveNote] = useState(notes[0]);
  const [content, setContent] = useState(activeNote.content);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">AI Notes</h1>
        <button className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold shadow-lg" style={{ backgroundColor: '#fc6813' }}>
          <FileEdit className="w-5 h-5" />
          New Note
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-2">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => { setActiveNote(note); setContent(note.content); }}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                activeNote.id === note.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-semibold text-gray-900">{note.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{note.date}</p>
            </div>
          ))}
        </div>

        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <input
              type="text"
              value={activeNote.title}
              className="text-2xl font-bold text-gray-900 border-none focus:outline-none"
            />
            <div className="flex gap-2">
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <Save className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <Trash2 className="w-5 h-5 text-red-600" />
              </button>
            </div>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 resize-none"
            placeholder="Start typing your notes..."
          />
        </div>
      </div>
    </div>
  );
}
