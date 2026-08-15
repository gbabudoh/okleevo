import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { closeFiscalYear } from '@/lib/accounting/accounting';

/** Most recent fiscal-year-end date on/before `today`, per the business's configured FYE. */
function mostRecentFiscalYearEnd(fyeMonth: number, fyeDay: number, today: Date): Date {
  const thisYearEnd = new Date(today.getFullYear(), fyeMonth - 1, fyeDay, 23, 59, 59, 999);
  if (thisYearEnd <= today) return thisYearEnd;
  return new Date(today.getFullYear() - 1, fyeMonth - 1, fyeDay, 23, 59, 59, 999);
}

export const POST = withMultiTenancy(async (req, { user, business }) => {
  try {
    const body = await req.json().catch(() => ({}));
    let asOfDate: Date;
    if (body.asOfDate) {
      asOfDate = new Date(body.asOfDate);
      if (isNaN(asOfDate.getTime())) {
        return NextResponse.json({ error: 'Invalid asOfDate' }, { status: 400 });
      }
      // A caller-supplied date (e.g. "2026-08-15") parses as midnight — normalize
      // to end-of-day so same-day activity is included in the close, not excluded.
      asOfDate.setHours(23, 59, 59, 999);
    } else {
      asOfDate = mostRecentFiscalYearEnd(business.fiscalYearEndMonth, business.fiscalYearEndDay, new Date());
    }

    const fiscalYearLabel = body.fiscalYearLabel || String(asOfDate.getFullYear());

    const result = await closeFiscalYear(user.businessId, user.id, fiscalYearLabel, asOfDate);

    if (!result.closed) {
      return NextResponse.json({ error: result.reason }, { status: 409 });
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Year-end close error:', error);
    return NextResponse.json({ error: 'Failed to close fiscal year' }, { status: 500 });
  }
});
