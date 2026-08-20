import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { processSmartNoteAssist } from '@/lib/smart-notes-nlp';

/**
 * Note Intelligence Engine (Zero External LLM Cost)
 * 
 * Uses on-device / local extractive NLP and commitment parsing:
 * - 100% Local Inference ($0.00 token cost)
 * - Ultra-fast (< 5ms response time)
 * - 100% Private (No customer notes transmitted to third parties)
 */
export const POST = withMultiTenancy(async (req) => {
  try {
    const { title, content } = await req.json();

    if (!title?.trim() && !content?.trim()) {
      return NextResponse.json({ error: 'title or content is required' }, { status: 400 });
    }

    // Run local extractive NLP intelligence
    const result = processSmartNoteAssist(title || '', content || '');

    return NextResponse.json({
      summary: result.summary,
      actionItems: result.actionItems,
      suggestedTags: result.suggestedTags,
      model: result.engine,
      latencyMs: result.processingTimeMs,
    });
  } catch (error) {
    console.error('Note Assist Processing Error:', error);
    return NextResponse.json({ error: 'Failed to process note intelligence' }, { status: 500 });
  }
});
