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
  const curCode = (invoice.currency || 'GBP').toUpperCase();

  // Header: Okleevo Orange Banner
  doc.setFillColor(234, 88, 12); doc.rect(0, 0, 210, 42, 'F');
  doc.setFontSize(22); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
  doc.text((invoice.businessName || 'OKLEEVO WORKSPACE').toUpperCase(), 20, 20);
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL INVOICE & PROOF OF SERVICE', 20, 28);
  doc.text(`REF: ${invoice.number}`, 190, 20, { align: 'right' });
  doc.text(`STATUS: ${invoice.status.toUpperCase()}`, 190, 28, { align: 'right' });

  // Bill To & Payment Details Cards (Light grey / Gainsboro cards)
  doc.setTextColor(15, 23, 42);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, 50, 80, 26, 3, 3, 'F');
  doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(100, 116, 139);
  doc.text('BILLED TO (CLIENT):', 25, 57);
  doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 23, 42);
  doc.text(invoice.clientName, 25, 64);
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 116, 139);
  doc.text(invoice.clientEmail || '', 25, 70);

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(110, 50, 80, 26, 3, 3, 'F');
  doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(100, 116, 139);
  doc.text('PAYMENT DETAILS:', 115, 57);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(51, 65, 85);
  doc.text(`Issue Date: ${fmtDate(invoice.createdAt)}`, 115, 64);
  doc.text(`Due Date: ${fmtDate(invoice.dueDate)}`, 115, 70);
  doc.text(`Currency: ${curCode}`, 160, 64);

  // Line items header: Very Light Grey / Gainsboro
  doc.setFillColor(241, 245, 249); // Gainsboro / slate-100
  doc.rect(20, 84, 170, 8, 'F');
  doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(51, 65, 85);
  doc.text('ITEM DELIVERABLE', 24, 89);
  doc.text('QTY', 115, 89);
  doc.text(`UNIT RATE (${sym})`, 140, 89);
  doc.text(`SUBTOTAL (${sym})`, 188, 89, { align: 'right' });

  let yPos = 98;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);

  invoice.items.forEach((item, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(20, yPos - 5, 170, 8, 'F');
    }
    doc.text(item.description, 24, yPos);
    doc.text(item.quantity.toString(), 115, yPos);
    doc.text(`${sym}${item.rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 140, yPos);
    doc.text(`${sym}${(item.quantity * item.rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 188, yPos, { align: 'right' });
    yPos += 8;
  });

  // Total Summary Card: Light Grey / Gainsboro with right-aligned totals
  yPos += 8;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(110, yPos, 80, 24, 3, 3, 'F');
  doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(100, 116, 139);
  doc.text('TOTAL BILLED:', 116, yPos + 8);
  doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(234, 88, 12); // Okleevo Orange
  doc.text(`${sym}${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${curCode}`, 184, yPos + 18, { align: 'right' });

  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(148, 163, 184);
  doc.text(`Generated securely by Okleevo Invoicing Engine · ${invoice.businessName || 'Okleevo'}`, 105, 280, { align: 'center' });

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
