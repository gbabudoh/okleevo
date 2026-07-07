import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { getModuleById } from '@/lib/module-catalogue';
import { getGuideSections, hasGuideContent } from '@/lib/guides';
import GuideTabs from './GuideTabs';

export default async function GuideDetailPage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params;
  const mod = getModuleById(moduleId);
  if (!mod) notFound();

  const hasContent = hasGuideContent(moduleId);
  const sections = hasContent ? getGuideSections(moduleId) : [];

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-24 md:pb-10">
      <Link href="/dashboard/guides" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
        <ChevronLeft className="w-4 h-4" />
        All Guides
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-8">
        <div className="flex items-center gap-4">
          <div className={`p-3 bg-linear-to-br ${mod.color} rounded-xl shrink-0`}>
            <mod.icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 tracking-tight">{mod.label}</h1>
            <p className="text-gray-500 text-sm">{mod.desc}</p>
          </div>
        </div>
      </div>

      {hasContent ? (
        <GuideTabs sections={sections} />
      ) : (
        <div className="flex flex-col items-center justify-center py-16 gap-3 bg-white rounded-2xl border border-dashed border-gray-300">
          <p className="text-sm font-semibold text-gray-400">A full guide for {mod.label} is coming soon.</p>
          <p className="text-xs text-gray-400">In the meantime, submit a support ticket if you need help with this module.</p>
        </div>
      )}
    </div>
  );
}
