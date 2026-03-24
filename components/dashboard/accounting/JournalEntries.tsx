"use client";

import React from "react";
import { FileText, Calendar, Eye, Edit3, Trash2 } from "lucide-react";
import accounting from "accounting";

interface JournalEntry {
  id: string;
  date: string | Date;
  description: string;
  reference?: string;
  status: string;
  entries: {
    debit: number;
    credit: number;
    account: { name: string };
  }[];
}

interface JournalEntriesProps {
  entries: JournalEntry[];
  onViewEntry: (entry: JournalEntry) => void;
  onEditEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (id: string) => void;
}

export const JournalEntries: React.FC<JournalEntriesProps> = ({
  entries,
  onViewEntry,
  onEditEntry,
  onDeleteEntry,
}) => {
  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        const totalDebit = entry.entries.reduce((sum, e) => sum + e.debit, 0);
        return (
          <div
            key={entry.id}
            className="bg-white/40 border border-white/50 rounded-xl p-5 hover:bg-white/60 hover:shadow-lg transition-all backdrop-blur-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-md">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{entry.description}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(entry.date).toLocaleDateString("en-GB")}
                    </span>
                    <span className="text-sm text-gray-600">Ref: {entry.reference || "N/A"}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm bg-green-100 text-green-700`}>
                      {entry.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => onViewEntry(entry)} className="p-2 hover:bg-blue-50/50 rounded-lg"><Eye className="w-5 h-5 text-blue-600" /></button>
                <button onClick={() => onEditEntry(entry)} className="p-2 hover:bg-purple-50/50 rounded-lg"><Edit3 className="w-5 h-5 text-purple-600" /></button>
                <button onClick={() => onDeleteEntry(entry.id)} className="p-2 hover:bg-red-50/50 rounded-lg"><Trash2 className="w-5 h-5 text-red-600" /></button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">
                {accounting.formatMoney(totalDebit, "£")}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
