// Invoice model types
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  userId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  paidDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInvoiceInput {
  clientId: string;
  items: Omit<InvoiceItem, 'id' | 'total'>[];
  dueDate: Date;
  notes?: string;
}

export function calculateInvoiceTotal(items: InvoiceItem[], taxRate = 0): number {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * taxRate;
  return subtotal + tax;
}

export function isOverdue(invoice: Invoice): boolean {
  return invoice.status !== 'paid' && new Date() > new Date(invoice.dueDate);
}
