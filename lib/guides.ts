import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export type GuideSectionId = 'overview' | 'user-guide' | 'tutorials' | 'faq';

export interface GuideSection {
  id: GuideSectionId;
  label: string;
  content: string;
  available: boolean;
}

const SECTIONS: { id: GuideSectionId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'user-guide', label: 'User Guide' },
  { id: 'tutorials', label: 'Tutorials' },
  { id: 'faq', label: 'FAQ' },
];

const CONTENT_ROOT = path.join(process.cwd(), 'content', 'guides');

// Server-only: reads static Markdown files authored per module. Not for use
// in client components (fs is unavailable in the browser).
export function hasGuideContent(moduleId: string): boolean {
  return fs.existsSync(path.join(CONTENT_ROOT, moduleId));
}

export function getGuideSections(moduleId: string): GuideSection[] {
  const dir = path.join(CONTENT_ROOT, moduleId);
  return SECTIONS.map(({ id, label }) => {
    const filePath = path.join(dir, `${id}.md`);
    if (!fs.existsSync(filePath)) {
      return { id, label, content: '', available: false };
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { content } = matter(raw);
    return { id, label, content: content.trim(), available: true };
  });
}

export function listModuleIdsWithGuides(): string[] {
  if (!fs.existsSync(CONTENT_ROOT)) return [];
  return fs.readdirSync(CONTENT_ROOT, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
}
