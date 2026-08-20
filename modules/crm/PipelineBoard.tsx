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
  { id: 'proposal', label: 'Proposal', accent: 'from-yellow-400 to-amber-300', dot: 'bg-yellow-400' },
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
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1 snap-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {STAGES.map((stage) => {
        const stageClients = clients.filter((c) => c.pipelineStage === stage.id);
        const stageValue = stageClients.reduce((sum, c) => sum + c.revenue, 0);
        const isOver = overStage === stage.id;

        const stageDragStyle = !isOver
          ? 'border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60'
          : stage.id === 'new'
          ? 'bg-slate-100/90 dark:bg-slate-800/80 border-2 border-dashed border-slate-400 dark:border-slate-500 shadow-md shadow-slate-400/10 scale-[1.01]'
          : stage.id === 'contacted'
          ? 'bg-blue-50/90 dark:bg-blue-950/50 border-2 border-dashed border-blue-500 shadow-md shadow-blue-500/15 scale-[1.01]'
          : stage.id === 'proposal'
          ? 'bg-yellow-50/90 dark:bg-yellow-950/50 border-2 border-dashed border-yellow-400 dark:border-yellow-500 shadow-md shadow-yellow-400/20 scale-[1.01]'
          : stage.id === 'negotiation'
          ? 'bg-purple-50/90 dark:bg-purple-950/50 border-2 border-dashed border-purple-500 shadow-md shadow-purple-500/15 scale-[1.01]'
          : stage.id === 'closed-won'
          ? 'bg-emerald-50/90 dark:bg-emerald-950/50 border-2 border-dashed border-emerald-500 shadow-md shadow-emerald-500/15 scale-[1.01]'
          : 'bg-rose-50/90 dark:bg-rose-950/50 border-2 border-dashed border-rose-500 shadow-md shadow-rose-500/15 scale-[1.01]';

        const stageCardBorder = stage.id === 'new'
          ? 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
          : stage.id === 'contacted'
          ? 'border-blue-200 dark:border-blue-900/60 hover:border-blue-400'
          : stage.id === 'proposal'
          ? 'border-yellow-300 dark:border-yellow-900/60 hover:border-yellow-400'
          : stage.id === 'negotiation'
          ? 'border-purple-200 dark:border-purple-900/60 hover:border-purple-400'
          : stage.id === 'closed-won'
          ? 'border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-400'
          : 'border-rose-200 dark:border-rose-900/60 hover:border-rose-400';

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
            className={`shrink-0 w-[280px] snap-start rounded-3xl border p-4 space-y-3 flex flex-col justify-between transition-all duration-200 ${stageDragStyle}`}
          >
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${stage.dot}`} />
                  <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wide truncate">{stage.label}</h3>
                </div>
                <span className="shrink-0 text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {stageClients.length}
                </span>
              </div>
              <p className="text-xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
                £{stageValue.toLocaleString()}
              </p>
              <div className={`h-1 mt-2.5 rounded-full bg-gradient-to-r ${stage.accent}`} />
            </div>

            <div className="space-y-3 flex-1 min-h-[100px] max-h-[calc(100vh-420px)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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
                  className={`group bg-white dark:bg-slate-950 rounded-2xl border ${stageCardBorder} p-4 cursor-pointer hover:shadow-2xs transition-all space-y-3 ${
                    draggingId === client.id ? 'opacity-40 scale-95' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-mono font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                        {client.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate leading-tight">{client.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 truncate flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 shrink-0 text-slate-400" /> {client.company}
                        </p>
                      </div>
                    </div>
                    <GripVertical className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {client.tags && client.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {client.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] font-extrabold text-slate-600 dark:text-slate-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-900">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-tight">
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDotColor(client.status)}`} />
                      {client.status}
                    </span>
                    <span className="text-xs font-extrabold font-mono text-slate-900 dark:text-white">
                      £{client.revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}

              {stageClients.length === 0 && (
                <div className="py-8 text-center rounded-2xl border border-dashed border-slate-200/60 dark:border-slate-800/60">
                  <p className="text-[11px] font-medium text-slate-400">Drop a deal here</p>
                </div>
              )}

              <button
                type="button"
                onClick={() => onAddToStage(stage.id)}
                className="w-full py-2.5 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs font-extrabold text-slate-400 hover:text-orange-500 hover:border-orange-300 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" /> <span>Add deal</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
