import { prisma } from '@/lib/prisma';
import { Prisma } from '@/lib/prisma-client';

type LedgerAccount = Prisma.PromiseReturnType<typeof prisma.ledgerAccount.findFirstOrThrow<{
  include: { ledgerEntries: { include: { journalEntry: true } } }
}>>;

type LedgerEntry = Prisma.PromiseReturnType<typeof prisma.ledgerEntry.findFirstOrThrow<{
  include: { journalEntry: true }
}>>;

interface ReportItem {
  name: string;
  total: number;
}

interface BalanceItem {
  name: string;
  balance: number;
}

export async function getProfitAndLoss(businessId: string, startDate: Date, endDate: Date) {
  const accounts = await prisma.ledgerAccount.findMany({
    where: {
      businessId,
      type: { in: ['REVENUE', 'EXPENSE'] },
    },
    include: {
      ledgerEntries: {
        where: {
          journalEntry: {
            date: { gte: startDate, lte: endDate },
            status: 'POSTED',
          },
        },
        include: { journalEntry: true }
      },
    },
  });

  const report = {
    revenue: [] as ReportItem[],
    expenses: [] as ReportItem[],
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
  };

  accounts.forEach((account: LedgerAccount) => {
    const total = account.ledgerEntries.reduce((sum: number, entry: LedgerEntry) => {
      if (account.type === 'REVENUE') return sum + entry.credit - entry.debit;
      if (account.type === 'EXPENSE') return sum + entry.debit - entry.credit;
      return sum;
    }, 0);

    if (account.type === 'REVENUE') {
      report.revenue.push({ name: account.name, total });
      report.totalRevenue += total;
    } else {
      report.expenses.push({ name: account.name, total });
      report.totalExpenses += total;
    }
  });

  report.netProfit = report.totalRevenue - report.totalExpenses;
  return report;
}

export async function getBalanceSheet(businessId: string, date: Date) {
  const accounts = await prisma.ledgerAccount.findMany({
    where: { businessId },
    include: {
      ledgerEntries: {
        where: {
          journalEntry: {
            date: { lte: date },
            status: 'POSTED',
          },
        },
        include: { journalEntry: true }
      },
    },
  });

  const report = {
    assets: [] as BalanceItem[],
    liabilities: [] as BalanceItem[],
    equity: [] as BalanceItem[],
    totalAssets: 0,
    totalLiabilities: 0,
    totalEquity: 0,
  };

  accounts.forEach((account: LedgerAccount) => {
    const balance = account.ledgerEntries.reduce((sum: number, entry: LedgerEntry) => {
      // Normal balances: Assets (Dr), Liabilities (Cr), Equity (Cr)
      if (account.type === 'ASSET') return sum + entry.debit - entry.credit;
      if (account.type === 'LIABILITY' || account.type === 'EQUITY') return sum + entry.credit - entry.debit;
      // Revenue/Expense balances should be closed to equity, but for a "live" report we can show them
      if (account.type === 'REVENUE') return sum + entry.credit - entry.debit;
      if (account.type === 'EXPENSE') return sum + entry.debit - entry.credit;
      return sum;
    }, 0);

    if (balance === 0) return;

    if (account.type === 'ASSET') {
      report.assets.push({ name: account.name, balance });
      report.totalAssets += balance;
    } else if (account.type === 'LIABILITY') {
      report.liabilities.push({ name: account.name, balance });
      report.totalLiabilities += balance;
    } else if (account.type === 'EQUITY') {
      report.equity.push({ name: account.name, balance });
      report.totalEquity += balance;
    }
  });

  return report;
}
