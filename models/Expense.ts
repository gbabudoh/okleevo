// Expense model types
export interface Expense {
  id: string;
  userId: string;
  title: string;
  amount: number;
  category: string;
  date: Date;
  vendor?: string;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'other';
  receipt?: string;
  notes?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExpenseInput {
  title: string;
  amount: number;
  category: string;
  date: Date;
  vendor?: string;
  paymentMethod: Expense['paymentMethod'];
  receipt?: string;
  notes?: string;
  tags?: string[];
}

export interface UpdateExpenseInput {
  title?: string;
  amount?: number;
  category?: string;
  date?: Date;
  vendor?: string;
  paymentMethod?: Expense['paymentMethod'];
  receipt?: string;
  notes?: string;
  tags?: string[];
}

export function getTotalExpenses(expenses: Expense[]): number {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

export function getExpensesByCategory(expenses: Expense[], category: string): Expense[] {
  return expenses.filter(expense => expense.category === category);
}

export function getExpensesByDateRange(expenses: Expense[], startDate: Date, endDate: Date): Expense[] {
  return expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= startDate && expenseDate <= endDate;
  });
}
