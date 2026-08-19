"use client";

import { useMemo, useState } from 'react';
import { Plus, Trash2, Flag, Link2, Check } from 'lucide-react';

interface TimelineTask {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'PAUSED';
  startDate?: string | null;
  dueDate?: string | null;
  dependsOn?: { id: string; title: string; status: string }[];
}

interface TimelineMilestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

interface TimelineProject {
  id: string;
  startDate?: string | null;
  dueDate?: string | null;
  tasks: TimelineTask[];
  milestones: TimelineMilestone[];
}

const TASK_BAR_COLOR: Record<TimelineTask['status'], string> = {
  TODO: 'bg-slate-300',
  IN_PROGRESS: 'bg-indigo-500',
  REVIEW: 'bg-amber-500',
  DONE: 'bg-emerald-500',
  PAUSED: 'bg-rose-400',
};

function dayMs(d: string | Date) {
  return new Date(d).setHours(0, 0, 0, 0);
}

export default function ProjectTimeline({ project, onRefresh }: { project: TimelineProject; onRefresh: () => void }) {
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');
  const [addingMilestone, setAddingMilestone] = useState(false);
  const [editingDepsFor, setEditingDepsFor] = useState<string | null>(null);
  const [savingDeps, setSavingDeps] = useState(false);

  const range = useMemo(() => {
    const dates: number[] = [];
    if (project.startDate) dates.push(dayMs(project.startDate));
    if (project.dueDate) dates.push(dayMs(project.dueDate));
    project.tasks.forEach(t => {
      if (t.startDate) dates.push(dayMs(t.startDate));
      if (t.dueDate) dates.push(dayMs(t.dueDate));
    });
    project.milestones.forEach(m => dates.push(dayMs(m.dueDate)));

    if (dates.length === 0) return null;

    const dayLength = 86400000;
    const min = Math.min(...dates) - dayLength * 2;
    const max = Math.max(...dates) + dayLength * 2;
    return { min, max, span: Math.max(max - min, dayLength) };
  }, [project]);

  const pct = (ms: number) => {
    if (!range) return 0;
    return Math.min(100, Math.max(0, ((ms - range.min) / range.span) * 100));
  };

  const rows = useMemo(() => {
    return [...project.tasks].sort((a, b) => {
      const aDate = a.dueDate ? dayMs(a.dueDate) : Infinity;
      const bDate = b.dueDate ? dayMs(b.dueDate) : Infinity;
      return aDate - bDate;
    });
  }, [project.tasks]);

  const handleAddMilestone = async () => {
    if (!newMilestoneTitle.trim() || !newMilestoneDate) return;
    setAddingMilestone(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newMilestoneTitle.trim(), dueDate: newMilestoneDate }),
      });
      if (res.ok) {
        setNewMilestoneTitle('');
        setNewMilestoneDate('');
        onRefresh();
      }
    } finally {
      setAddingMilestone(false);
    }
  };

  const handleToggleMilestone = async (m: TimelineMilestone) => {
    const res = await fetch(`/api/milestones/${m.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !m.completed }),
    });
    if (res.ok) onRefresh();
  };

  const handleDeleteMilestone = async (id: string) => {
    const res = await fetch(`/api/milestones/${id}`, { method: 'DELETE' });
    if (res.ok) onRefresh();
  };

  const handleToggleDependency = async (taskId: string, depId: string, current: string[]) => {
    setSavingDeps(true);
    const next = current.includes(depId) ? current.filter(id => id !== depId) : [...current, depId];
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dependsOnIds: next }),
      });
      if (res.ok) onRefresh();
    } finally {
      setSavingDeps(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Gantt */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">Timeline</h3>
          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> In progress</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Done</span>
            <span className="flex items-center gap-1"><Flag className="w-3 h-3 text-purple-500" /> Milestone</span>
          </div>
        </div>

        {!range || (rows.length === 0 && project.milestones.length === 0) ? (
          <p className="text-sm text-slate-400 text-center py-10">
            Add start/due dates to tasks or milestones to see them on the timeline.
          </p>
        ) : (
          <div className="space-y-1.5">
            {/* Milestone markers strip */}
            {project.milestones.length > 0 && (
              <div className="relative h-6 border-b border-slate-100 mb-2">
                {project.milestones.map(m => (
                  <div
                    key={m.id}
                    title={`${m.title} — ${new Date(m.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                    className="absolute -translate-x-1/2 top-0"
                    style={{ left: `${pct(dayMs(m.dueDate))}%` }}
                  >
                    <Flag className={`w-3.5 h-3.5 ${m.completed ? 'text-emerald-500' : 'text-purple-500'}`} fill="currentColor" />
                  </div>
                ))}
              </div>
            )}

            {rows.map(t => {
              const hasRange = t.startDate && t.dueDate;
              const start = t.startDate ? dayMs(t.startDate) : t.dueDate ? dayMs(t.dueDate) : null;
              const end = t.dueDate ? dayMs(t.dueDate) : start;
              const deps = t.dependsOn || [];

              return (
                <div key={t.id} className="group">
                  <div className="flex items-center gap-3">
                    <div className="w-40 sm:w-48 shrink-0 flex items-center gap-1.5 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">{t.title}</p>
                    </div>
                    <div className="flex-1 relative h-6">
                      {start !== null && end !== null && (
                        hasRange ? (
                          <div
                            className={`absolute top-1 h-4 rounded-full ${TASK_BAR_COLOR[t.status]} opacity-90`}
                            style={{ left: `${pct(start)}%`, width: `${Math.max(1.5, pct(end) - pct(start))}%` }}
                          />
                        ) : (
                          <div
                            className={`absolute top-0.5 w-3 h-3 rounded-full -translate-x-1/2 ${TASK_BAR_COLOR[t.status]}`}
                            style={{ left: `${pct(end)}%` }}
                          />
                        )
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingDepsFor(editingDepsFor === t.id ? null : t.id)}
                      className="shrink-0 p-1 text-slate-300 hover:text-indigo-600 rounded transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                      title="Manage dependencies"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {deps.length > 0 && (
                    <p className="ml-[calc(10rem+0.75rem)] sm:ml-[calc(12rem+0.75rem)] text-[10px] text-slate-400 mt-0.5">
                      Blocked by: {deps.map(d => d.title).join(', ')}
                    </p>
                  )}

                  {editingDepsFor === t.id && (
                    <div className="ml-[calc(10rem+0.75rem)] sm:ml-[calc(12rem+0.75rem)] mt-1.5 mb-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1 max-w-xs">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Depends on</p>
                      {project.tasks.filter(other => other.id !== t.id).length === 0 ? (
                        <p className="text-[11px] text-slate-400">No other tasks in this project.</p>
                      ) : (
                        project.tasks.filter(other => other.id !== t.id).map(other => {
                          const currentIds = deps.map(d => d.id);
                          const checked = currentIds.includes(other.id);
                          return (
                            <label key={other.id} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={savingDeps}
                                onChange={() => handleToggleDependency(t.id, other.id, currentIds)}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              />
                              <span className="truncate">{other.title}</span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Milestones list */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Milestones</h3>

        <div className="space-y-2 mb-3">
          {project.milestones.length === 0 ? (
            <p className="text-sm text-slate-400 py-2">No milestones yet. Add key checkpoints below.</p>
          ) : (
            project.milestones.map(m => (
              <div key={m.id} className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                <button
                  type="button"
                  onClick={() => handleToggleMilestone(m)}
                  className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer ${
                    m.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 hover:border-indigo-400'
                  }`}
                >
                  {m.completed && <Check className="w-3 h-3 text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${m.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{m.title}</p>
                  <p className="text-[11px] text-slate-400">{new Date(m.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <button type="button" onClick={() => handleDeleteMilestone(m.id)} className="shrink-0 p-1.5 text-slate-300 hover:text-rose-500 rounded-lg transition-colors cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
          <input
            type="text"
            placeholder="Milestone name"
            value={newMilestoneTitle}
            onChange={e => setNewMilestoneTitle(e.target.value)}
            className="flex-1 min-w-0 px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition"
          />
          <input
            type="date"
            value={newMilestoneDate}
            onChange={e => setNewMilestoneDate(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition"
          />
          <button
            type="button"
            disabled={addingMilestone || !newMilestoneTitle.trim() || !newMilestoneDate}
            onClick={handleAddMilestone}
            className="shrink-0 p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg transition-colors cursor-pointer"
            title="Add milestone"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
