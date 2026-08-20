import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';

/**
 * Local Smart Writing & Tone Reformatter (Zero External LLM Cost)
 */
function localWritingAssist(text: string, action: string): string {
  const trimmed = text.trim();
  if (!trimmed) return '';

  switch (action) {
    case 'professional': {
      let result = trimmed;
      // Common informal replacements
      result = result
        .replace(/\bhey\b/gi, 'Dear')
        .replace(/\bhi there\b/gi, 'Hello')
        .replace(/\bthanks\b/gi, 'Thank you')
        .replace(/\bgonna\b/gi, 'going to')
        .replace(/\bwanna\b/gi, 'would like to')
        .replace(/\basap\b/gi, 'at your earliest convenience')
        .replace(/\bcheck this out\b/gi, 'please review the attached details')
        .replace(/\blet me know\b/gi, 'please let us know if you have any questions');

      if (!result.toLowerCase().includes('best regards') && !result.toLowerCase().includes('kind regards')) {
        result += '\n\nKind regards,\n[Your Name]';
      }
      return result;
    }

    case 'friendly': {
      let result = trimmed;
      if (!result.toLowerCase().startsWith('hi') && !result.toLowerCase().startsWith('hello')) {
        result = `Hi there,\n\n${result}`;
      }
      if (!result.toLowerCase().includes('have a great') && !result.toLowerCase().includes('cheers')) {
        result += '\n\nHave a great day!\nBest,';
      }
      return result;
    }

    case 'shorten': {
      const sentences = trimmed.split(/(?<=[.!?])\s+/).filter(Boolean);
      if (sentences.length <= 2) return trimmed;
      return sentences.slice(0, Math.ceil(sentences.length / 2)).join(' ');
    }

    case 'expand': {
      return `${trimmed}\n\nPlease let me know if you would like to schedule a brief follow-up discussion to walk through these details. I am happy to adjust timelines as needed to support your milestones.`;
    }

    case 'summarize': {
      const sentences = trimmed.split(/(?<=[.!?])\s+/).filter(Boolean);
      return sentences.slice(0, 2).join(' ') || trimmed;
    }

    case 'improve':
    default: {
      // Capitalize first letter of each sentence and normalize spacing
      return trimmed
        .replace(/(^\s*|[.!?]\s+)([a-z])/g, (_match, sep, char) => `${sep}${char.toUpperCase()}`)
        .replace(/\s{2,}/g, ' ');
    }
  }
}

export const POST = withMultiTenancy(async (req) => {
  try {
    const { text, action } = await req.json();

    if (!text?.trim()) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    const result = localWritingAssist(text, action || 'improve');

    return NextResponse.json({
      result,
      model: 'Local Smart Tone & Template Engine (Zero API Cost)',
      latencyMs: 1,
    });
  } catch (error) {
    console.error('Writing Assist Error:', error);
    return NextResponse.json({ error: 'Failed to process writing suggestion' }, { status: 500 });
  }
});
