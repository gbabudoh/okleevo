import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';

/**
 * Content Template Engine (Zero External LLM Cost)
 */
export const POST = withMultiTenancy(async (req, { business }) => {
  try {
    const { template, formData } = await req.json();

    if (!template || !formData) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const title = formData.topic || formData.title || template.name || 'Executive Update';
    const tone = formData.tone || formData.style || 'Professional';

    const content = `# ${title}\n\n**Audience:** ${formData.targetAudience || 'General'}\n**Tone:** ${tone}\n\n## Executive Summary\n${business.name} is pleased to present this update on ${title}. We are committed to delivering reliable, enterprise-grade execution across all project deliverables.\n\n## Key Strategic Pillars\n1. **Operational Excellence:** Streamlined execution with measurable variance tracking.\n2. **Team Alignment:** Collaborative sprint pacing and accountability.\n3. **Client Satisfaction:** High-touch communication and transparent delivery.\n\n## Next Steps\nFor further details or inquiries, contact the ${business.name} operations team.`;

    return NextResponse.json({
      content,
      model: 'Local Template Engine (Zero API Cost)',
      latencyMs: 1,
    });
  } catch (error) {
    console.error('Content Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
  }
});
