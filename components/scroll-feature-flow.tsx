"use client";

import { motion, type Variants } from "framer-motion";
import { Calendar, ScanSearch, Users, AudioLines, FileText, CheckSquare, ArrowRight } from "lucide-react";

const stepVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.25, duration: 0.5, ease: "easeOut" as const },
  }),
};

function PipelineStep({ icon: Icon, label, i, accent }: { icon: typeof Calendar; label: string; i: number; accent: string }) {
  return (
    <motion.div
      custom={i}
      variants={stepVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="flex flex-col items-center gap-2 flex-1"
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${accent}`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-xs font-medium text-gray-600 text-center">{label}</span>
    </motion.div>
  );
}

function PipelineArrow({ i }: { i: number }) {
  return (
    <motion.div
      custom={i}
      variants={stepVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="hidden sm:flex items-center px-1 text-gray-300"
    >
      <ArrowRight className="w-5 h-5" />
    </motion.div>
  );
}

export function ScrollFeatureFlow() {
  return (
    <div className="max-w-5xl mx-auto px-6 space-y-16">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
          It connects itself. You don&apos;t have to.
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          What happens automatically behind the scenes, from a client booking to a finished meeting.
        </p>
      </div>

      {/* Booking → CRM pipeline */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10">
        <h3 className="text-sm font-semibold text-gray-900 mb-6 text-center">Client Booking → CRM Pipeline</h3>
        <div className="flex items-center justify-between gap-1 sm:gap-3">
          <PipelineStep i={0} icon={Calendar} label="Client books a slot" accent="bg-orange-50 border-orange-100 text-orange-600" />
          <PipelineArrow i={1} />
          <PipelineStep i={1} icon={ScanSearch} label="File auto-scanned" accent="bg-blue-50 border-blue-100 text-blue-600" />
          <PipelineArrow i={2} />
          <PipelineStep i={2} icon={Users} label="Lands in your CRM" accent="bg-emerald-50 border-emerald-100 text-emerald-600" />
        </div>
      </div>

      {/* Meeting → Task pipeline */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10">
        <h3 className="text-sm font-semibold text-gray-900 mb-6 text-center">Meeting → Task Board</h3>
        <div className="flex items-center justify-between gap-1 sm:gap-3">
          <PipelineStep i={0} icon={AudioLines} label="Call is transcribed" accent="bg-purple-50 border-purple-100 text-purple-600" />
          <PipelineArrow i={1} />
          <PipelineStep i={1} icon={FileText} label="AI summarizes it" accent="bg-pink-50 border-pink-100 text-pink-600" />
          <PipelineArrow i={2} />
          <PipelineStep i={2} icon={CheckSquare} label="Tasks appear on your board" accent="bg-indigo-50 border-indigo-100 text-indigo-600" />
        </div>
      </div>
    </div>
  );
}
