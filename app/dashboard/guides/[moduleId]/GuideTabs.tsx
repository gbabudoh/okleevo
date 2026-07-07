"use client";

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import type { GuideSection } from '@/lib/guides';

// Custom renderers so Markdown content matches the app's flat, enterprise
// styling without depending on a Tailwind typography plugin.
const markdownComponents: Components = {
  h1: ({ children }) => <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3 first:mt-0">{children}</h2>,
  h2: ({ children }) => <h3 className="text-lg font-semibold text-gray-900 mt-7 mb-2.5 first:mt-0">{children}</h3>,
  h3: ({ children }) => <h4 className="text-base font-semibold text-gray-900 mt-5 mb-2">{children}</h4>,
  p: ({ children }) => <p className="text-sm text-gray-600 leading-relaxed mb-4">{children}</p>,
  ul: ({ children }) => <ul className="list-disc list-outside pl-5 space-y-1.5 mb-4 text-sm text-gray-600">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-outside pl-5 space-y-1.5 mb-4 text-sm text-gray-600">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
  code: ({ children }) => <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono text-indigo-700">{children}</code>,
  a: ({ href, children }) => <a href={href} className="text-indigo-600 hover:text-indigo-700 font-medium underline underline-offset-2">{children}</a>,
  blockquote: ({ children }) => <blockquote className="border-l-2 border-indigo-200 pl-4 italic text-gray-500 mb-4">{children}</blockquote>,
  hr: () => <hr className="border-gray-100 my-6" />,
};

export default function GuideTabs({ sections }: { sections: GuideSection[] }) {
  const firstAvailable = sections.find(s => s.available)?.id || sections[0]?.id;
  const [activeTab, setActiveTab] = useState(firstAvailable);

  const activeSection = sections.find(s => s.id === activeTab);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-100 px-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveTab(section.id)}
            disabled={!section.available}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer shrink-0 disabled:opacity-30 disabled:cursor-not-allowed ${
              activeTab === section.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className="p-5 sm:p-8">
        {activeSection?.available ? (
          <ReactMarkdown components={markdownComponents}>{activeSection.content}</ReactMarkdown>
        ) : (
          <p className="text-sm text-gray-400">This section isn&apos;t available yet.</p>
        )}
      </div>
    </div>
  );
}
