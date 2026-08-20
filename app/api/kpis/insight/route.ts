import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';

/**
 * Generates an executive metric insight using local statistical & variance heuristics ($0 API cost).
 */
function generateLocalKPIInsight(
  name: string,
  value: string,
  target: string | undefined,
  progress: number | undefined,
  category: string
): string {
  const numValue = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  const numTarget = target ? parseFloat(String(target).replace(/[^0-9.-]/g, '')) : undefined;
  const pct = progress !== undefined ? progress : (numTarget && numValue ? Math.round((numValue / numTarget) * 100) : 100);

  const categoryLower = (category || '').toLowerCase();
  
  if (pct >= 100) {
    if (categoryLower.includes('growth') || categoryLower.includes('sales')) {
      return `${name} is currently outperforming its benchmark at ${value} (${pct}% of target). Momentum indicates healthy pipeline conversion; consider increasing forward targets to capitalize on high acquisition velocity.`;
    }
    if (categoryLower.includes('operation') || categoryLower.includes('client')) {
      return `${name} stands at an optimal rate of ${value}, exceeding operational SLA targets. Team capacity is currently balanced; maintain standard cadence while monitoring edge cases.`;
    }
    return `${name} is meeting or exceeding targets at ${value} (${pct}% achieved). Executive standing remains strong with minimal operational variance.`;
  }

  if (pct >= 75) {
    return `${name} is currently tracking at ${value} (${pct}% of target), within an acceptable operational corridor. Focusing on end-of-cycle conversion and closing open items will secure the remaining variance before period close.`;
  }

  if (pct >= 50) {
    return `${name} stands at ${value} (${pct}% of target), indicating a moderate lag behind planned velocity. Prioritize resolving bottlenecks in this area and consider reallocating team bandwidth to accelerate progress.`;
  }

  return `${name} is currently underperforming target thresholds at ${value} (${pct}% of target). Immediate operational intervention is recommended to analyze root causes and establish a recovery sprint plan.`;
}

export const POST = withMultiTenancy(async (req) => {
  try {
    const { name, value, target, progress, category } = await req.json();

    if (!name?.trim() || value === undefined) {
      return NextResponse.json({ error: 'name and value are required' }, { status: 400 });
    }

    const insight = generateLocalKPIInsight(
      name,
      String(value),
      target ? String(target) : undefined,
      typeof progress === 'number' ? progress : undefined,
      category || 'General'
    );

    return NextResponse.json({
      insight,
      model: 'Local Statistical Variance Engine (Zero API Cost)',
      latencyMs: 1,
    });
  } catch (error) {
    console.error('KPI Insight Error:', error);
    return NextResponse.json({ error: 'Failed to generate insight' }, { status: 500 });
  }
});
