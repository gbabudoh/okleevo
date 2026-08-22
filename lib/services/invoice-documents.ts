import { jsPDF } from 'jspdf';

export interface InvoiceDocumentData {
  number: string;
  clientName: string;
  clientEmail?: string | null;
  amount: number;
  currency?: string | null;
  status: string;
  createdAt: Date;
  dueDate: Date;
  items: { description: string; quantity: number; rate: number }[];
  businessName: string;
}

const fmtDate = (d: Date) => d.toISOString().split('T')[0];

const getCurrencySymbol = (cur?: string | null) => {
  const map: Record<string, string> = {
    GBP: '£', USD: '$', EUR: '€', NGN: '₦', GHS: 'GH₵', KES: 'KSh', ZAR: 'R', CAD: 'C$', AUD: 'A$'
  };
  return (cur && map[cur.toUpperCase()]) || '$';
};

export function generateInvoicePdf(invoice: InvoiceDocumentData): Buffer {
  const doc = new jsPDF();
  const sym = getCurrencySymbol(invoice.currency);

  doc.setFillColor(59, 130, 246); doc.rect(0, 0, 210, 40, 'F');
  doc.setFontSize(24); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
  doc.text('INVOICE', 105, 20, { align: 'center' });
  doc.setFontSize(14); doc.text(invoice.number, 105, 30, { align: 'center' });

  doc.setTextColor(0, 0, 0); doc.setFillColor(249, 250, 251);
  doc.roundedRect(20, 50, 80, 25, 3, 3, 'F');
  doc.setFontSize(11); doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 25, 58); doc.setFont('helvetica', 'normal');
  doc.text(invoice.clientName, 25, 65);
  doc.setFontSize(9); doc.text(invoice.clientEmail || '', 25, 71);

  doc.setFillColor(249, 250, 251); doc.roundedRect(110, 50, 80, 25, 3, 3, 'F');
  doc.setFontSize(11); doc.setFont('helvetica', 'bold');
  doc.text('Invoice Details:', 115, 58); doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  doc.text(`Issue Date: ${fmtDate(invoice.createdAt)}`, 115, 65);
  doc.text(`Due Date: ${fmtDate(invoice.dueDate)}`, 115, 71);

  doc.setFontSize(10); doc.setFont('helvetica', 'bold');
  doc.setFillColor(59, 130, 246); doc.setTextColor(255, 255, 255);
  doc.rect(20, 85, 170, 8, 'F');
  doc.text('Description', 25, 90); doc.text('Qty', 125, 90);
  doc.text('Rate', 145, 90); doc.text('Amount', 170, 90);
  doc.setTextColor(0, 0, 0); doc.setFont('helvetica', 'normal');

  let yPos = 100;
  invoice.items.forEach((item, i) => {
    if (i % 2 === 0) { doc.setFillColor(249, 250, 251); doc.rect(20, yPos - 5, 170, 8, 'F'); }
    doc.text(item.description, 25, yPos); doc.text(item.quantity.toString(), 125, yPos);
    doc.text(`${sym}${item.rate}`, 145, yPos); doc.text(`${sym}${(item.quantity * item.rate).toLocaleString()}`, 170, yPos);
    yPos += 8;
  });

  yPos += 10;
  doc.setFillColor(59, 130, 246); doc.rect(20, yPos - 5, 170, 12, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(255, 255, 255);
  doc.text('TOTAL:', 145, yPos + 3); doc.text(`${sym}${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${invoice.currency || 'USD'}`, 170, yPos + 3);

  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(128, 128, 128);
  doc.text('Thank you for your business!', 105, 280, { align: 'center' });

  return Buffer.from(doc.output('arraybuffer'));
}

export function generateInvoiceCsv(invoice: InvoiceDocumentData): Buffer {
  const sym = getCurrencySymbol(invoice.currency);
  const headers = ['Description', 'Quantity', 'Rate', 'Amount'];
  const rows = invoice.items.map(item => [item.description, item.quantity, item.rate, item.quantity * item.rate]);
  let csv = `Invoice: ${invoice.number}\nClient: ${invoice.clientName}\nEmail: ${invoice.clientEmail || ''}\nCurrency: ${invoice.currency || 'USD'}\nIssue: ${fmtDate(invoice.createdAt)}\nDue: ${fmtDate(invoice.dueDate)}\nStatus: ${invoice.status}\n\n`;
  csv += headers.join(',') + '\n' + rows.map(r => r.join(',')).join('\n');
  csv += `\n\nTotal,,,${sym}${invoice.amount}`;
  return Buffer.from('\ufeff' + csv, 'utf-8');
}
