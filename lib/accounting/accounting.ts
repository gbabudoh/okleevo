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

  // Find or create necessary accounts
  // In a real app, these should be pre-configured
  const [cashAccount, revenueAccount] = await Promise.all([
    getOrCreateAccount(invoice.businessId, '1000', 'Cash at Bank', 'ASSET', 'Current Assets'),
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
    getOrCreateAccount(expense.businessId, '1000', 'Cash at Bank', 'ASSET', 'Current Assets'),
    getOrCreateAccount(expense.businessId, '5000', expense.category, 'EXPENSE', 'Operating Expenses'),
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

async function getOrCreateAccount(businessId: string, code: string, name: string, type: AccountType, category: string) {
  let account = await prisma.ledgerAccount.findFirst({
    where: { businessId, code },
  });

  if (!account) {
    account = await prisma.ledgerAccount.create({
      data: { businessId, code, name, type, category, isSystem: true },
    });
  }

  return account;
}
