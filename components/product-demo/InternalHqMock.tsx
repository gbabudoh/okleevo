"use client";

import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, Lightbulb, LayoutDashboard } from "lucide-react";
import { internalHqFixture } from "./fixtures";

/**
 * Mirrors the real dashboard's actual visual language — light theme,
 * bg-white/60 sidebar, real chat-bubble styling from
 * app/dashboard/collaboration/page.tsx, real Kanban card styling from
 * app/dashboard/tasks/page.tsx — rather than an invented dark aesthetic.
 */
export function InternalHqMock() {
  const { chatMessages, kanban, aiInsight } = internalHqFixture;

  return (
    <div className="absolute inset-0 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <div className="w-full md:w-52 shrink-0 bg-white/60 backdrop-blur-xl border-b md:border-b-0 md:border-r border-gray-100 p-4 flex md:flex-col justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-50 border border-orange-200/90 text-orange-600 text-xs font-bold">
            <LayoutDashboard className="w-3.5 h-3.5" />
            Virtual HQ
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold pl-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Team huddle active
          </div>
          <div className="space-y-1 text-[11px] text-gray-500 pl-1">
            <div>London · 06:44 PM</div>
            <div>New York · 01:44 PM</div>
          </div>
        </div>
        <div className="hidden md:block p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-[10px] text-gray-500">
          Isolated storage verified
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 p-4 md:p-5 space-y-4 md:overflow-y-auto">
        {/* Chat — mirrors the real bubble styling from the Collaboration page */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-xs p-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">Team Chat</div>
          <div className="space-y-3">
            {chatMessages.map((msg, i) => {
              const isMe = i === 1;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.3, duration: 0.4 }}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs shadow-xs ${
                    isMe
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                  }`}>
                    {!isMe && <p className="text-[10px] font-bold text-slate-500 mb-0.5">{msg.name}</p>}
                    <p className="leading-relaxed">{msg.text}</p>
                    <p className={`text-[9px] font-medium mt-1 text-right ${isMe ? "text-indigo-200" : "text-slate-400"}`}>{msg.time}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Kanban — mirrors real card styling from the Tasks page */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: "To Do", items: kanban.todo, dot: "bg-slate-400" },
            { label: "In Progress", items: kanban.inProgress, dot: "bg-indigo-500" },
            { label: "Done", items: kanban.done, dot: "bg-emerald-500" },
          ].map((col) => (
            <div key={col.label} className="space-y-2">
              <div className="flex items-center gap-1.5 px-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{col.label}</span>
              </div>
              {col.items.map((item, i) => (
                <div key={i} className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
                  <p className="text-[11px] font-semibold text-slate-800 leading-snug mb-1.5">{item.title}</p>
                  <span className="text-[9px] font-semibold bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md border border-indigo-200/60">{item.tag}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* AI Insight */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="bg-indigo-50 border border-indigo-100 rounded-2xl p-3.5 space-y-2"
        >
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">AI Meeting Intelligence</span>
          </div>
          <div className="flex items-start gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-700 leading-snug">{aiInsight.actionPoint}</p>
          </div>
          <div className="flex items-start gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-700 leading-snug">{aiInsight.keyDecision}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
