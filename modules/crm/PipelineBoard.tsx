"use client";

import { useState } from 'react';
import { Plus, GripVertical, Building2 } from 'lucide-react';

export interface PipelineClient {
  id: string;
  name: string;
  email: string;
  company: string;
  clientType: 'business' | 'individual';
  status: 'active' | 'lead' | 'inactive' | 'customer';
  pipelineStage: 'new' | 'contacted' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  revenue: number;
  tags?: string[];
}

const STAGES: { id: PipelineClient['pipelineStage']; label: string; accent: string; dot: string }[] = [
  { id: 'new', label: 'New', accent: 'from-slate-400 to-slate-500', dot: 'bg-slate-400' },
  { id: 'contacted', label: 'Contacted', accent: 'from-blue-400 to-blue-600', dot: 'bg-blue-500' },
  { id: 'proposal', label: 'Proposal', accent: 'from-amber-400 to-orange-500', dot: 'bg-amber-500' },
  { id: 'negotiation', label: 'Negotiation', accent: 'from-purple-400 to-indigo-500', dot: 'bg-purple-500' },
  { id: 'closed-won', label: 'Closed Won', accent: 'from-emerald-400 to-teal-600', dot: 'bg-emerald-500' },
  { id: 'closed-lost', label: 'Closed Lost', accent: 'from-rose-400 to-rose-600', dot: 'bg-rose-500' },
];

const statusDotColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-emerald-500';
    case 'lead': return 'bg-blue-500';
    case 'customer': return 'bg-indigo-500';
    default: return 'bg-gray-400';
  }
};

export function PipelineBoard({
  clients,
  loading,
  onSelect,
  onStageChange,
  onAddToStage,
}: {
  clients: PipelineClient[];
  loading: boolean;
  onSelect: (client: PipelineClient) => void;
  onStageChange: (clientId: string, stage: PipelineClient['pipelineStage']) => void;
  onAddToStage: (stage: PipelineClient['pipelineStage']) => void;
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
        <p className="text-sm font-semibold text-gray-400">Loading pipeline...</p>
      </div>
    );
  }

  return (
    <div className="flex gap-3.5 overflow-x-auto pb-3 -mx-1 px-1 snap-x">
      {STAGES.map((stage) => {
        const stageClients = clients.filter((c) => c.pipelineStage === stage.id);
        const stageValue = stageClients.reduce((sum, c) => sum + c.revenue, 0);
        const isOver = overStage === stage.id;

        return (
          <div
            key={stage.id}
            onDragOver={(e) => { e.preventDefault(); setOverStage(stage.id); }}
            onDragLeave={() => setOverStage((s) => (s === stage.id ? null : s))}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData('text/plain') || draggingId;
              if (id) onStageChange(id, stage.id);
              setOverStage(null);
              setDraggingId(null);
            }}
            className={`shrink-0 w-[270px] snap-start rounded-2xl border transition-colors ${
              isOver
                ? 'border-blue-400 bg-blue-50/60 dark:bg-blue-950/20'
                : 'border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-900/60'
            }`}
          >
            <div className="px-3.5 pt-3.5 pb-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${stage.dot}`} />
                  <h3 className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide truncate">{stage.label}</h3>
                </div>
                <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400">
                  {stageClients.length}
                </span>
              </div>
              <p className="text-sm font-extrabold text-gray-900 dark:text-white">
                £{stageValue.toLocaleString()}
              </p>
              <div className={`h-1 mt-2 rounded-full bg-gradient-to-r ${stage.accent}`} />
            </div>

            <div className="px-2.5 pb-2.5 space-y-2 min-h-[80px] max-h-[calc(100vh-420px)] overflow-y-auto">
              {stageClients.map((client) => (
                <div
                  key={client.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', client.id);
                    e.dataTransfer.effectAllowed = 'move';
                    setDraggingId(client.id);
                  }}
                  onDragEnd={() => { setDraggingId(null); setOverStage(null); }}
                  onClick={() => onSelect(client)}
                  className={`group bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-3 cursor-pointer hover:shadow-md hover:border-gray-200 dark:hover:border-slate-700 transition-all ${
                    draggingId === client.id ? 'opacity-40' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-[11px] shrink-0">
                        {client.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-bold text-gray-900 dark:text-white truncate leading-tight">{client.name}</p>
                        <p className="text-[10px] text-gray-400 truncate flex items-center gap-1">
                          <Building2 className="w-2.5 h-2.5 shrink-0" /> {client.company}
                        </p>
                      </div>
                    </div>
                    <GripVertical className="w-3.5 h-3.5 text-gray-200 dark:text-slate-700 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {client.tags && client.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {client.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-[9px] font-semibold text-gray-500 dark:text-gray-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-gray-400">
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDotColor(client.status)}`} />
                      {client.status}
                    </span>
                    <span className="text-[11.5px] font-extrabold text-gray-900 dark:text-white">
                      £{client.revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}

              {stageClients.length === 0 && (
                <div className="py-6 text-center text-[11px] text-gray-300 dark:text-slate-700 font-medium">
                  Drop a deal here
                </div>
              )}

              <button
                type="button"
                onClick={() => onAddToStage(stage.id)}
                className="w-full py-2 rounded-xl border border-dashed border-gray-200 dark:border-slate-700 text-[11px] font-bold text-gray-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add deal
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
