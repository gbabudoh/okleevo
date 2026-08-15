import { prisma } from '@/lib/prisma';
import type { AccountType } from '@/lib/prisma-client';

/**
 * Automatically creates a journal entry for a paid invoice.
 * Dr Accounts Receivable (or Cash)
 * Cr Sales Revenue
 */
export async function journalizeInvoice(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { business: true },
  });

  if (!invoice || invoice.status !== 'PAID') return;

  const [cashAccount, revenueAccount] = await Promise.all([
    getOrCreateAccount(invoice.businessId, '1000', 'Cash at Bank', 'ASSET', 'Current Assets', true),
    getOrCreateAccount(invoice.businessId, '4000', 'Sales Revenue', 'REVENUE', 'Revenue'),
  ]);

  return await prisma.journalEntry.create({
    data: {
      businessId: invoice.businessId,
      userId: invoice.userId,
      description: `Payment for Invoice ${invoice.number}`,
      reference: invoice.number,
      date: invoice.paidAt || new Date(),
      status: 'POSTED',
      invoice: { connect: { id: invoiceId } },
      entries: {
        create: [
          { accountId: cashAccount.id, debit: invoice.amount },
          { accountId: revenueAccount.id, credit: invoice.amount },
        ],
      },
    },
  });
}

/**
 * Automatically creates a journal entry for an expense.
 * Dr Expense Category Account
 * Cr Cash at Bank
 */
export async function journalizeExpense(expenseId: string) {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
  });

  if (!expense) return;

  const [cashAccount, expenseAccount] = await Promise.all([
    getOrCreateAccount(expense.businessId, '1000', 'Cash at Bank', 'ASSET', 'Current Assets', true),
    getOrCreateExpenseCategoryAccount(expense.businessId, expense.category),
  ]);

  return await prisma.journalEntry.create({
    data: {
      businessId: expense.businessId,
      userId: expense.userId,
      description: expense.description,
      date: expense.date,
      status: 'POSTED',
      expense: { connect: { id: expenseId } },
      entries: {
        create: [
          { accountId: expenseAccount.id, debit: expense.amount },
          { accountId: cashAccount.id, credit: expense.amount },
        ],
      },
    },
  });
}

/**
 * Voids a journal entry (sets status: VOID) rather than deleting it — reports
 * filter to status: 'POSTED', so this removes it from every balance/report
 * while preserving the row for audit purposes. Used when an invoice payment
 * or expense is reopened/deleted after having already been journalized.
 */
export async function voidJournalEntry(journalEntryId: string) {
  return prisma.journalEntry.update({
    where: { id: journalEntryId },
    data: { status: 'VOID' },
  });
}

/**
 * Posts a reversing entry for a POSTED journal entry — mirrors every line's
 * debit/credit — rather than editing or deleting the original. Both entries
 * stay visible and POSTED; their net effect on every account is zero. This is
 * the standard correction mechanism for a posted ledger (never rewrite history).
 */
export async function createReversalEntry(originalEntryId: string, businessId: string, userId: string) {
  const original = await prisma.journalEntry.findFirst({
    where: { id: originalEntryId, businessId },
    include: { entries: true },
  });

  if (!original) throw new Error('Journal entry not found');
  if (original.status !== 'POSTED') throw new Error('Only posted entries can be reversed');

  return prisma.journalEntry.create({
    data: {
      businessId,
      userId,
      description: `Reversal of: ${original.description}`,
      reference: original.reference ? `REV-${original.reference}` : `REV-${original.id.slice(-8)}`,
      date: new Date(),
      status: 'POSTED',
      entries: {
        create: original.entries.map((e) => ({
          accountId: e.accountId,
          debit: e.credit,
          credit: e.debit,
          description: e.description || undefined,
        })),
      },
    },
  });
}

interface CloseFiscalYearResult {
  closed: boolean;
  reason?: string;
  netIncome?: number;
  journalEntryId?: string;
}

/**
 * Closes the books for a fiscal year: zeroes every Revenue/Expense account's
 * current (all-time-to-date) POSTED balance via one balanced journal entry,
 * sweeping the net into Retained Earnings. Because this always operates on
 * the *current* balance, closing a later year automatically only nets the
 * activity since the prior close — no separate "since last close" tracking
 * needed. Idempotent per fiscal year via a unique reference string.
 */
export async function closeFiscalYear(
  businessId: string,
  userId: string,
  fiscalYearLabel: string,
  asOfDate: Date
): Promise<CloseFiscalYearResult> {
  const reference = `YEAR-END-CLOSE-${fiscalYearLabel}`;

  const existingClose = await prisma.journalEntry.findFirst({
    where: { businessId, reference, status: 'POSTED' },
  });
  if (existingClose) {
    return { closed: false, reason: `Fiscal year ${fiscalYearLabel} has already been closed.` };
  }

  const accounts = await prisma.ledgerAccount.findMany({
    where: { businessId, type: { in: ['REVENUE', 'EXPENSE'] } },
    include: {
      ledgerEntries: {
        where: { journalEntry: { status: 'POSTED', date: { lte: asOfDate } } },
      },
    },
  });

  const lines: { accountId: string; debit: number; credit: number }[] = [];
  let totalRevenue = 0;
  let totalExpenses = 0;

  for (const account of accounts) {
    if (account.type === 'REVENUE') {
      const balance = account.ledgerEntries.reduce((s, e) => s + e.credit - e.debit, 0);
      if (Math.abs(balance) < 0.005) continue;
      totalRevenue += balance;
      // Zero out a credit-normal account with a debit.
      lines.push({ accountId: account.id, debit: balance, credit: 0 });
    } else {
      const balance = account.ledgerEntries.reduce((s, e) => s + e.debit - e.credit, 0);
      if (Math.abs(balance) < 0.005) continue;
      totalExpenses += balance;
      // Zero out a debit-normal account with a credit.
      lines.push({ accountId: account.id, debit: 0, credit: balance });
    }
  }

  if (lines.length === 0) {
    return { closed: false, reason: 'No revenue or expense activity to close for this period.' };
  }

  const netIncome = totalRevenue - totalExpenses;
  const retainedEarnings = await getOrCreateAccount(businessId, '3000', 'Retained Earnings', 'EQUITY', 'Equity');

  if (netIncome >= 0) {
    lines.push({ accountId: retainedEarnings.id, debit: 0, credit: netIncome });
  } else {
    lines.push({ accountId: retainedEarnings.id, debit: -netIncome, credit: 0 });
  }

  const entry = await prisma.journalEntry.create({
    data: {
      businessId,
      userId,
      description: `Year-end close — FY${fiscalYearLabel}`,
      reference,
      date: asOfDate,
      status: 'POSTED',
      entries: { create: lines },
    },
  });

  return { closed: true, netIncome, journalEntryId: entry.id };
}

async function getOrCreateAccount(businessId: string, code: string, name: string, type: AccountType, category: string, isCashAccount = false) {
  let account = await prisma.ledgerAccount.findFirst({
    where: { businessId, code },
  });

  if (!account) {
    account = await prisma.ledgerAccount.create({
      data: { businessId, code, name, type, category, isSystem: true, isCashAccount },
    });
  }

  return account;
}

/**
 * Expense categories are user-defined free text, so unlike the fixed system
 * accounts above, each distinct category gets (or reuses) its own EXPENSE
 * ledger account — matching how a real chart of accounts separates expense
 * types (5000 Office Supplies, 5010 Travel, ...) rather than dumping every
 * expense into one bucket account.
 */
async function getOrCreateExpenseCategoryAccount(businessId: string, category: string) {
  const name = category?.trim() || 'General Expenses';

  let account = await prisma.ledgerAccount.findFirst({
    where: { businessId, type: 'EXPENSE', name: { equals: name, mode: 'insensitive' } },
  });

  if (!account) {
    const existingExpenseAccounts = await prisma.ledgerAccount.findMany({
      where: { businessId, type: 'EXPENSE' },
      select: { code: true },
    });
    const maxCode = existingExpenseAccounts.reduce((max, a) => {
      const n = parseInt(a.code, 10);
      return Number.isFinite(n) && n > max ? n : max;
    }, 4999);
    const nextCode = String(Math.max(maxCode + 10, 5000));

    account = await prisma.ledgerAccount.create({
      data: { businessId, code: nextCode, name, type: 'EXPENSE', category: 'Operating Expenses', isSystem: false },
    });
  }

  return account;
}
