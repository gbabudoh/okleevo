"use client";

import React, { useState, useRef } from 'react';
import {
  Package, Plus, Search, Filter, Download, Upload,
  AlertTriangle, CheckCircle, DollarSign,
  Trash2, Eye, MoreVertical,
  Grid, List, Tag, MapPin,
  Box, Boxes, PackageX, PackagePlus, PackageMinus,
  Warehouse, Zap, Target, Activity,
  X, Check, QrCode, History, User,
  ClipboardList, ShoppingCart, Bell, FileText, RefreshCw,
  Heart, Home, Dumbbell, BookOpen, Wrench, Sparkles, Briefcase, HelpCircle,
  BarChart3, ArrowUpDown
} from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { jsPDF } from 'jspdf';
import JsBarcode from 'jsbarcode';

const inputCls = 'w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all';
const labelCls = 'text-xs font-semibold text-gray-600';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  unitPrice: number;
  totalValue: number;
  supplier: string;
  location: string;
  lastRestocked: Date;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'overstocked';
  image?: string;
  description?: string;
  unit: string;
  weight?: number;
  dimensions?: string;
  expiryDate?: Date;
  tags?: string[];
}

interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  date: Date;
  reason: string;
  user: string;
}

// Hidden until real Shopify app credentials are configured — the backend
// (connect/callback/sync routes) is fully built, just not exposed in the UI yet.
const SHOPIFY_SYNC_ENABLED = false;

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventory');
      if (res.ok) {
        const data = await res.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const processedItems = data.items.map((item: any) => ({
          ...item,
          lastRestocked: item.lastRestocked ? new Date(item.lastRestocked) : new Date(item.updatedAt || item.createdAt),
          expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
        }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const processedMovements = data.movements.map((m: any) => ({
          ...m,
          date: new Date(m.date),
        }));
        setItems(processedItems);
        setStockMovements(processedMovements);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);
  const importInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    fetchInventory();
    fetch('/api/suppliers').then(res => res.json()).then(data => setSuppliers(Array.isArray(data) ? data : [])).catch(() => setSuppliers([]));
  }, []);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showStockMovement, setShowStockMovement] = useState(false);
  const [showLowStockAlerts, setShowLowStockAlerts] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [adjustType, setAdjustType] = useState<'IN' | 'OUT' | 'ADJUSTMENT'>('IN');
  const [adjustQuantity, setAdjustQuantity] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [newItem, setNewItem] = useState({ name: '', sku: '', category: '', quantity: '', unit: 'pcs', unitPrice: '', supplierId: '', location: '', minStock: '', maxStock: '' });

  const dynamicCategories = [
    { id: 'all', name: 'All Items', icon: Grid, count: items.length },
    { id: 'electronics', name: 'Electronics', icon: Zap, count: items.filter(i => i.category?.toLowerCase() === 'electronics').length },
    { id: 'clothing', name: 'Clothing', icon: Tag, count: items.filter(i => i.category?.toLowerCase() === 'clothing').length },
    { id: 'food', name: 'Food & Beverage', icon: Package, count: items.filter(i => i.category?.toLowerCase() === 'food').length },
    { id: 'furniture', name: 'Furniture', icon: Box, count: items.filter(i => i.category?.toLowerCase() === 'furniture').length },
    { id: 'supplies', name: 'Supplies', icon: ClipboardList, count: items.filter(i => i.category?.toLowerCase() === 'supplies').length },
    { id: 'health-beauty', name: 'Health & Beauty', icon: Heart, count: items.filter(i => i.category?.toLowerCase() === 'health-beauty').length },
    { id: 'home-kitchen', name: 'Home & Kitchen', icon: Home, count: items.filter(i => i.category?.toLowerCase() === 'home-kitchen').length },
    { id: 'home-decor', name: 'Home Décor', icon: Warehouse, count: items.filter(i => i.category?.toLowerCase() === 'home-decor').length },
    { id: 'sports-outdoors', name: 'Sports & Outdoors', icon: Dumbbell, count: items.filter(i => i.category?.toLowerCase() === 'sports-outdoors').length },
    { id: 'toys-games', name: 'Toys & Games', icon: Boxes, count: items.filter(i => i.category?.toLowerCase() === 'toys-games').length },
    { id: 'books-stationery', name: 'Books & Stationery', icon: BookOpen, count: items.filter(i => i.category?.toLowerCase() === 'books-stationery').length },
    { id: 'automotive-diy', name: 'Automotive & DIY', icon: Wrench, count: items.filter(i => i.category?.toLowerCase() === 'automotive-diy').length },
    { id: 'packaging-shipping', name: 'Packaging & Shipping Materials', icon: PackagePlus, count: items.filter(i => i.category?.toLowerCase() === 'packaging-shipping').length },
    { id: 'cleaning-maintenance', name: 'Cleaning & Maintenance', icon: Sparkles, count: items.filter(i => i.category?.toLowerCase() === 'cleaning-maintenance').length },
    { id: 'services', name: 'Services', icon: Briefcase, count: items.filter(i => i.category?.toLowerCase() === 'services').length },
    { id: 'other', name: 'Other', icon: HelpCircle, count: items.filter(i => i.category?.toLowerCase() === 'other').length },
  ];

  const showNotify = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.quantity) return;
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newItem.name,
          sku: newItem.sku || undefined,
          category: newItem.category || undefined,
          quantity: Number(newItem.quantity),
          unit: newItem.unit,
          price: Number(newItem.unitPrice) || 0,
          supplierId: newItem.supplierId || undefined,
          location: newItem.location || undefined,
          minQuantity: Number(newItem.minStock) || 5,
          maxQuantity: Number(newItem.maxStock) || 100,
          reorderPoint: Number(newItem.minStock) || 5,
        }),
      });
      if (res.ok) {
        await fetchInventory();
        setShowAddItem(false);
        setNewItem({ name: '', sku: '', category: '', quantity: '', unit: 'pcs', unitPrice: '', supplierId: '', location: '', minStock: '', maxStock: '' });
        showNotify('Item added to inventory');
      } else {
        showNotify('Failed to add item', 'info');
      }
    } catch {
      showNotify('Failed to add item', 'info');
    }
  };

  const openAdjustStock = (item: InventoryItem) => {
    setAdjustingItem(item);
    setAdjustType('IN');
    setAdjustQuantity('');
    setAdjustReason('');
  };

  const handleAdjustStock = async () => {
    if (!adjustingItem || !adjustQuantity || Number(adjustQuantity) < 0) return;
    setAdjustSubmitting(true);
    try {
      const res = await fetch(`/api/inventory/${adjustingItem.id}/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: adjustType, quantity: Number(adjustQuantity), reason: adjustReason || undefined }),
      });
      if (res.ok) {
        await fetchInventory();
        setAdjustingItem(null);
        showNotify('Stock adjusted successfully');
      } else {
        const err = await res.json().catch(() => ({}));
        showNotify(err.error || 'Failed to adjust stock', 'info');
      }
    } catch {
      showNotify('Failed to adjust stock', 'info');
    } finally {
      setAdjustSubmitting(false);
    }
  };

  const handleShopifySync = async () => {
    try {
      const statusRes = await fetch('/api/integrations/shopify');
      const status = await statusRes.json();
      if (!status.connected) {
        showNotify('Connect Shopify first in Settings > Integrations', 'info');
        return;
      }
      showNotify('Syncing with Shopify…', 'info');
      const res = await fetch('/api/integrations/shopify/sync', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        await fetchInventory();
        showNotify(`Synced — ${data.created} created, ${data.updated} updated`);
      } else {
        showNotify(data.error || 'Shopify sync failed', 'info');
      }
    } catch {
      showNotify('Shopify sync failed', 'info');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'SKU', 'Category', 'Quantity', 'Unit', 'Price', 'Location', 'Min Stock', 'Max Stock'];
    const rows = filteredItems.map(item => [
      item.name, item.sku, item.category, item.quantity, item.unit,
      item.unitPrice, item.location, item.minStock, item.maxStock,
    ]);
    let csv = 'Inventory Report\n';
    csv += `Generated: ${new Date().toLocaleDateString()}\n\n`;
    csv += headers.join(',') + '\n';
    csv += rows.map(row => row.map(cell => `"${cell ?? ''}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotify('Inventory exported to CSV');
  };

  const buildReportData = () => {
    const totalValue = items.reduce((acc, i) => acc + (i.totalValue || 0), 0);
    const totalUnits = items.reduce((acc, i) => acc + (i.quantity || 0), 0);

    const byCategory = new Map<string, { value: number; count: number }>();
    items.forEach(i => {
      const key = i.category || 'Uncategorized';
      const entry = byCategory.get(key) || { value: 0, count: 0 };
      entry.value += i.totalValue || 0;
      entry.count += 1;
      byCategory.set(key, entry);
    });
    const categoryBreakdown = [...byCategory.entries()]
      .map(([category, v]) => ({ category, ...v }))
      .sort((a, b) => b.value - a.value);

    const byStatus = new Map<string, number>();
    items.forEach(i => {
      const key = i.status.toLowerCase();
      byStatus.set(key, (byStatus.get(key) || 0) + 1);
    });

    const topItems = [...items].sort((a, b) => (b.totalValue || 0) - (a.totalValue || 0)).slice(0, 5);

    return { totalValue, totalUnits, totalProducts: items.length, categoryBreakdown, byStatus, topItems };
  };

  const handleExportReport = () => {
    const r = buildReportData();
    let csv = 'Inventory Report\n';
    csv += `Generated: ${new Date().toLocaleDateString()}\n`;
    csv += `Total Value: £${r.totalValue.toLocaleString()}\n`;
    csv += `Total Units: ${r.totalUnits.toLocaleString()}\n`;
    csv += `Total Products: ${r.totalProducts}\n\n`;

    csv += 'Value by Category\n';
    csv += 'Category,Items,Value\n';
    csv += r.categoryBreakdown.map(c => `"${c.category}",${c.count},${c.value.toFixed(2)}`).join('\n') + '\n\n';

    csv += 'Stock Status Breakdown\n';
    csv += 'Status,Count\n';
    csv += [...r.byStatus.entries()].map(([status, count]) => `"${getStatusConfig(status).label}",${count}`).join('\n') + '\n\n';

    csv += 'Top 5 Items by Value\n';
    csv += 'Name,SKU,Quantity,Value\n';
    csv += r.topItems.map(i => `"${i.name}","${i.sku}",${i.quantity},${(i.totalValue || 0).toFixed(2)}`).join('\n');

    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotify('Report exported to CSV');
  };

  const generateLabelsPDF = (itemsToLabel: InventoryItem[]) => {
    if (itemsToLabel.length === 0) {
      showNotify('No items to print labels for', 'info');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 8;
    const cols = 3;
    const rows = 8;
    const cellW = (pageWidth - margin * 2) / cols;
    const cellH = (pageHeight - margin * 2) / rows;
    const perPage = cols * rows;

    // Offscreen canvas reused for every barcode render — JsBarcode draws
    // directly onto it, then we read it back out as a PNG data URL for jsPDF.
    const barcodeCanvas = document.createElement('canvas');

    itemsToLabel.forEach((item, i) => {
      if (i > 0 && i % perPage === 0) doc.addPage();
      const posOnPage = i % perPage;
      const col = posOnPage % cols;
      const row = Math.floor(posOnPage / cols);
      const x = margin + col * cellW;
      const y = margin + row * cellH;

      doc.setDrawColor(200, 200, 200);
      doc.rect(x, y, cellW, cellH);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      const name = item.name.length > 26 ? `${item.name.slice(0, 26)}…` : item.name;
      doc.text(name, x + cellW / 2, y + 5, { align: 'center', maxWidth: cellW - 4 });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(90, 90, 90);
      doc.text(`£${item.unitPrice.toFixed(2)}`, x + cellW / 2, y + 10, { align: 'center' });

      const barcodeValue = item.barcode || item.sku;
      try {
        JsBarcode(barcodeCanvas, barcodeValue, {
          format: 'CODE128',
          displayValue: true,
          fontSize: 12,
          height: 40,
          margin: 4,
        });
        const dataUrl = barcodeCanvas.toDataURL('image/png');
        const imgW = cellW - 10;
        const imgH = cellH - 20;
        doc.addImage(dataUrl, 'PNG', x + 5, y + 13, imgW, imgH);
      } catch {
        // Falls back to plain text if JsBarcode rejects the value
        // (e.g. empty string) rather than failing the whole label sheet.
        doc.setFontSize(8);
        doc.text(barcodeValue, x + cellW / 2, y + cellH / 2, { align: 'center' });
      }
    });

    doc.save(`inventory-labels-${new Date().toISOString().split('T')[0]}.pdf`);
    showNotify(`Generated ${itemsToLabel.length} label${itemsToLabel.length === 1 ? '' : 's'}`);
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') inQuotes = !inQuotes;
      else if (ch === ',' && !inQuotes) { result.push(cur); cur = ''; }
      else cur += ch;
    }
    result.push(cur);
    return result;
  };

  const handleImportCSV = async (file: File) => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    const headerIdx = lines.findIndex(l => l.startsWith('Name,') || l.startsWith('"Name"'));
    const dataLines = headerIdx >= 0 ? lines.slice(headerIdx + 1) : lines.slice(1);

    // Match existing items by SKU so re-uploading the same spreadsheet updates
    // quantities/prices instead of silently skipping (SKU is unique, so a
    // second create attempt for the same SKU would otherwise just fail).
    const bySku = new Map(items.filter(i => i.sku).map(i => [i.sku.trim().toLowerCase(), i]));

    let createdCount = 0;
    let updatedCount = 0;
    let failedCount = 0;

    for (const line of dataLines) {
      const [name, sku, category, quantity, unit, price, location, minStock, maxStock] = parseCSVLine(line);
      if (!name?.trim()) continue;

      const trimmedSku = sku?.trim();
      const existing = trimmedSku ? bySku.get(trimmedSku.toLowerCase()) : undefined;

      try {
        if (existing) {
          const res = await fetch(`/api/inventory/${existing.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: name.trim(),
              category: category?.trim() || undefined,
              quantity: Number(quantity) || 0,
              unit: unit?.trim() || 'pcs',
              unitPrice: Number(price) || 0,
              location: location?.trim() || undefined,
              minStock: Number(minStock) || 5,
              maxStock: Number(maxStock) || 100,
              reorderPoint: Number(minStock) || 5,
            }),
          });
          if (res.ok) updatedCount++; else failedCount++;
        } else {
          const res = await fetch('/api/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: name.trim(),
              sku: trimmedSku || undefined,
              category: category?.trim() || undefined,
              quantity: Number(quantity) || 0,
              unit: unit?.trim() || 'pcs',
              price: Number(price) || 0,
              location: location?.trim() || undefined,
              minQuantity: Number(minStock) || 5,
              maxQuantity: Number(maxStock) || 100,
              reorderPoint: Number(minStock) || 5,
            }),
          });
          if (res.ok) createdCount++; else failedCount++;
        }
      } catch {
        failedCount++;
      }
    }

    await fetchInventory();
    const summary = `${createdCount} created, ${updatedCount} updated${failedCount ? `, ${failedCount} failed` : ''}`;
    showNotify(dataLines.length > 0 ? `Imported — ${summary}` : 'No rows found in CSV', createdCount || updatedCount ? 'success' : 'info');
  };

  const handleDeleteItem = async () => {
    if (!deletingItem) return;
    try {
      const res = await fetch(`/api/inventory/${deletingItem.id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchInventory();
        setSelectedItem(null);
        showNotify('Item deleted successfully');
      } else {
        showNotify('Failed to delete item', 'info');
      }
    } catch {
      showNotify('Failed to delete item', 'info');
    }
    setShowDeleteModal(false);
    setDeletingItem(null);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.barcode && item.barcode.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in-stock':
        return { icon: CheckCircle, label: 'In Stock', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' };
      case 'low-stock':
        return { icon: AlertTriangle, label: 'Low Stock', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' };
      case 'out-of-stock':
        return { icon: PackageX, label: 'Out of Stock', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' };
      case 'overstocked':
        return { icon: PackagePlus, label: 'Overstocked', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' };
      default:
        return { icon: Package, label: 'Unknown', bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-400' };
    }
  };

  const totalInventoryValue = items.reduce((acc, item) => acc + (item.totalValue || 0), 0);
  const lowStockItems = items.filter(item => ['low-stock', 'out-of-stock'].includes(item.status.toLowerCase())).length;
  const totalUnits = items.reduce((acc, item) => acc + (item.quantity || 0), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-24 md:pb-10">

      {/* ── Hero Header ── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Warehouse className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-none">
                Inventory Control
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm font-medium mt-1.5">Real-time stock tracking and management</p>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 sm:items-end">
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <input
                ref={importInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImportCSV(file); e.target.value = ''; }}
              />
              <button onClick={() => importInputRef.current?.click()} className="p-2.5 bg-white hover:bg-gray-50 rounded-xl transition-all border border-gray-200 cursor-pointer" title="Import CSV">
                <Upload className="w-4 h-4 text-gray-500" />
              </button>
              <button onClick={handleExportCSV} className="p-2.5 bg-white hover:bg-gray-50 rounded-xl transition-all border border-gray-200 cursor-pointer" title="Export CSV">
                <Download className="w-4 h-4 text-gray-500" />
              </button>
              <button onClick={fetchInventory} className="p-2.5 bg-white hover:bg-gray-50 rounded-xl transition-all border border-gray-200 cursor-pointer" title="Refresh">
                <RefreshCw className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <button
              onClick={() => setShowAddItem(true)}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl px-5 py-2.5 active:scale-95 transition-all w-full sm:w-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Stock Value', value: `£${totalInventoryValue.toLocaleString()}`, sub: 'Total value', icon: DollarSign, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
          { label: 'Total Units', value: totalUnits.toLocaleString(), sub: 'All products', icon: Boxes, iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600' },
          { label: 'Alerts', value: String(lowStockItems), sub: 'Need attention', icon: AlertTriangle, iconBg: 'bg-rose-100', iconColor: 'text-rose-600' },
          { label: 'Products', value: String(items.length), sub: 'All categories', icon: Package, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
            <div className={`shrink-0 p-2.5 rounded-xl ${stat.iconBg}`}>
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider truncate">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900 leading-tight">{stat.value}</p>
              <p className="text-[10px] text-gray-400 truncate">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {[
          ...(SHOPIFY_SYNC_ENABLED ? [{ label: 'Shopify Sync', icon: ShoppingCart, color: 'text-blue-500', onClick: () => handleShopifySync() }] : []),
          { label: 'Print Labels', icon: QrCode, color: 'text-emerald-500', onClick: () => generateLabelsPDF(filteredItems) },
          { label: 'Stock History', icon: History, color: 'text-amber-500', onClick: () => setShowStockMovement(true) },
          { label: 'Low Stock Alerts', icon: Bell, color: 'text-indigo-500', onClick: () => setShowLowStockAlerts(true) },
          { label: 'Reports', icon: FileText, color: 'text-rose-500', onClick: () => setShowReports(true) },
        ].map((action, i) => (
          <button
            key={i}
            onClick={action.onClick}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-gray-100 rounded-xl text-[11px] font-semibold text-gray-700 whitespace-nowrap hover:shadow-md hover:border-gray-200 transition-all cursor-pointer shrink-0"
          >
            <action.icon className={`w-3.5 h-3.5 ${action.color}`} />
            {action.label}
          </button>
        ))}
      </div>

      {/* ── Search + Controls ── */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, SKU, or barcode…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all cursor-pointer shrink-0">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="hidden sm:inline">Filters</span>
        </button>
        <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shrink-0">
          {[{ id: 'grid', icon: Grid }, { id: 'list', icon: List }].map(mode => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id as 'grid' | 'list')}
              className={`p-2.5 transition-all cursor-pointer ${
                viewMode === mode.id ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <mode.icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* ── Category Pills ── */}
      <div className="relative">
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar-x">
          {dynamicCategories.map(cat => {
            const Icon = cat.icon;
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  active
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'bg-white border border-gray-100 text-gray-500 hover:border-gray-200 hover:text-gray-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.name}
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
        <div className="pointer-events-none absolute right-0 top-0 h-[calc(100%-8px)] w-16 bg-linear-to-l from-slate-50 to-transparent" />
      </div>

      {/* ── Items ── */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-2xl border border-gray-100">
          <Package className="w-10 h-10 text-gray-200" />
          <p className="text-sm font-bold text-gray-400">No items found</p>
          <button
            onClick={() => setShowAddItem(true)}
            className="mt-1 flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-black rounded-xl hover:bg-indigo-700 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add First Item
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredItems.map(item => {
            const sc = getStatusConfig(item.status);
            const stockPct = Math.min((item.quantity / Math.max(item.maxStock, 1)) * 100, 100);
            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-lg hover:shadow-gray-100 transition-all cursor-pointer group"
              >
                {/* Status + unit */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black ${sc.bg} ${sc.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                    {sc.label}
                  </span>
                  <span className="text-[10px] font-black text-gray-400 uppercase">{item.unit}</span>
                </div>

                {/* Name + SKU */}
                <div className="mb-3">
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-wider mb-0.5">{item.sku}</p>
                  <h3 className="text-sm font-black text-gray-900 leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {item.name}
                  </h3>
                </div>

                {/* Stock level bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-gray-400 font-bold">Stock</span>
                    <span className="text-xs font-black text-gray-900">
                      {item.quantity} <span className="text-gray-400 font-normal text-[10px]">/ {item.maxStock}</span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        stockPct > 50 ? 'bg-emerald-500' : stockPct > 20 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${stockPct}%` }}
                    />
                  </div>
                </div>

                {/* Price + Value */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-gray-50 rounded-xl p-2.5">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5">Unit</p>
                    <p className="text-xs font-black text-gray-900">£{item.unitPrice}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2.5">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5">Total</p>
                    <p className="text-xs font-black text-indigo-600">£{item.totalValue.toLocaleString()}</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1.5 mb-3 text-[10px] text-gray-400 font-bold">
                  <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                  <button
                    onClick={(e) => { e.stopPropagation(); showNotify('Adjust stock coming soon', 'info'); }}
                    className="flex-1 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wide rounded-xl hover:bg-indigo-700 transition-all cursor-pointer"
                  >
                    Adjust
                  </button>
                  <div className="relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === item.id ? null : item.id); }}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                    {activeMenu === item.id && (
                      <>
                        <div className="fixed inset-0 z-60" onClick={() => setActiveMenu(null)} />
                        <div className="absolute right-0 bottom-full mb-2 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-70 animate-in fade-in zoom-in duration-200">
                          {[
                            { label: 'View Details', icon: Eye, onClick: () => setSelectedItem(item) },
                            { label: 'Adjust Stock', icon: ArrowUpDown, onClick: () => openAdjustStock(item) },
                            { label: 'Stock History', icon: History, onClick: () => setShowStockMovement(true) },
                            { label: 'Print Labels', icon: QrCode, onClick: () => generateLabelsPDF([item]) },
                            { label: 'Delete Item', icon: Trash2, danger: true, onClick: () => { setDeletingItem(item); setShowDeleteModal(true); } },
                          ].map((opt, i) => (
                            <button
                              key={i}
                              onClick={(e) => { e.stopPropagation(); opt.onClick?.(); setActiveMenu(null); }}
                              className={`w-full px-3.5 py-2.5 text-left text-[11px] font-black flex items-center gap-2.5 hover:bg-gray-50 transition-colors cursor-pointer ${opt.danger ? 'text-red-500' : 'text-gray-700'}`}
                            >
                              <opt.icon className="w-3.5 h-3.5" />
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List view */
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Item</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Quantity</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Value</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredItems.map(item => {
                  const sc = getStatusConfig(item.status);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4 text-indigo-500" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-wider">{item.sku}</p>
                            <p className="text-sm font-black text-gray-900">{item.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-black text-gray-900">{item.quantity} <span className="text-gray-400 text-xs font-normal">{item.unit}</span></p>
                        <p className="text-[10px] text-gray-400">Reorder at {item.reorderPoint}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-black text-indigo-600">£{item.totalValue.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400">£{item.unitPrice}/unit</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500">
                          <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          {item.location}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="p-2 bg-gray-100 hover:bg-indigo-100 rounded-xl transition-all cursor-pointer group/eye"
                          >
                            <Eye className="w-3.5 h-3.5 text-gray-500 group-hover/eye:text-indigo-600 transition-colors" />
                          </button>
                          <div className="relative">
                            <button
                              onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === item.id ? null : item.id); }}
                              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all cursor-pointer"
                            >
                              <MoreVertical className="w-3.5 h-3.5 text-gray-500" />
                            </button>
                            {activeMenu === item.id && (
                              <>
                                <div className="fixed inset-0 z-60" onClick={() => setActiveMenu(null)} />
                                <div className="absolute right-0 bottom-full mb-2 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-70 animate-in fade-in zoom-in duration-200">
                                  {[
                                    { label: 'View Details', icon: Eye, onClick: () => { setSelectedItem(item); showNotify('Loading item details', 'info'); } },
                                    { label: 'Adjust Stock', icon: ArrowUpDown, onClick: () => openAdjustStock(item) },
                                    { label: 'Stock History', icon: History, onClick: () => { setShowStockMovement(true); showNotify('Loading stock history', 'info'); } },
                                    { label: 'Print Labels', icon: QrCode, onClick: () => generateLabelsPDF([item]) },
                                    { label: 'Delete Item', icon: Trash2, danger: true, onClick: () => { setDeletingItem(item); setShowDeleteModal(true); } },
                                  ].map((opt, i) => (
                                    <button
                                      key={i}
                                      onClick={(e) => { e.stopPropagation(); opt.onClick?.(); setActiveMenu(null); }}
                                      className={`w-full px-3.5 py-2.5 text-left text-[11px] font-black flex items-center gap-2.5 hover:bg-gray-50 transition-colors cursor-pointer ${opt.danger ? 'text-red-500' : 'text-gray-700'}`}
                                    >
                                      <opt.icon className="w-3.5 h-3.5" />
                                      {opt.label}
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Low Stock Alerts Modal ── */}
      {showLowStockAlerts && (() => {
        const alertItems = [...items]
          .filter(item => ['low-stock', 'out-of-stock'].includes(item.status.toLowerCase()))
          .sort((a, b) => (a.status.toLowerCase() === 'out-of-stock' ? -1 : 1) - (b.status.toLowerCase() === 'out-of-stock' ? -1 : 1));

        return (
          <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowLowStockAlerts(false)} />
            <div className="relative w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
              <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>
              <div className="flex items-center justify-between px-5 sm:px-6 py-5 border-b border-gray-100 shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Low stock alerts</h2>
                  <p className="text-xs text-gray-500 mt-1">{alertItems.length} item{alertItems.length === 1 ? '' : 's'} need attention</p>
                </div>
                <button onClick={() => setShowLowStockAlerts(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all cursor-pointer">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4">
                {alertItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <CheckCircle className="w-10 h-10 text-emerald-300" />
                    <p className="text-sm font-semibold text-gray-400">No low stock alerts right now</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {alertItems.map(item => {
                      const sc = getStatusConfig(item.status);
                      return (
                        <button
                          key={item.id}
                          onClick={() => { setShowLowStockAlerts(false); setSelectedItem(item); }}
                          className="w-full flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer text-left"
                        >
                          <div className={`shrink-0 w-9 h-9 rounded-xl ${sc.bg} flex items-center justify-center`}>
                            <sc.icon className={`w-4 h-4 ${sc.text}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.quantity} {item.unit} left · reorder at {item.reorderPoint}</p>
                          </div>
                          <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold ${sc.bg} ${sc.text}`}>
                            {sc.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Reports Modal ── */}
      {showReports && (() => {
        const r = buildReportData();
        const maxCategoryValue = Math.max(1, ...r.categoryBreakdown.map(c => c.value));
        return (
          <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowReports(false)} />
            <div className="relative w-full sm:max-w-xl bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
              <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>
              <div className="flex items-center justify-between px-5 sm:px-6 py-5 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                    <BarChart3 className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Inventory reports</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Generated {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                <button onClick={() => setShowReports(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all cursor-pointer">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-5">
                {/* Summary tiles */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-gray-900">£{r.totalValue.toLocaleString()}</p>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">Total Value</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-gray-900">{r.totalUnits.toLocaleString()}</p>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">Total Units</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-gray-900">{r.totalProducts}</p>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">Products</p>
                  </div>
                </div>

                {/* Value by category */}
                {r.categoryBreakdown.length > 0 && (
                  <div>
                    <p className={labelCls}>Value by category</p>
                    <div className="space-y-2 mt-2">
                      {r.categoryBreakdown.map(c => (
                        <div key={c.category} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-gray-700 truncate">{c.category} <span className="text-gray-400">({c.count})</span></span>
                            <span className="font-semibold text-gray-900 shrink-0">£{c.value.toLocaleString()}</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(c.value / maxCategoryValue) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock status breakdown */}
                <div>
                  <p className={labelCls}>Stock status</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[...r.byStatus.entries()].map(([status, count]) => {
                      const sc = getStatusConfig(status);
                      return (
                        <div key={status} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                          <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                          <span className="text-xs text-gray-600 flex-1 truncate">{sc.label}</span>
                          <span className="text-xs font-semibold text-gray-900">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top items by value */}
                {r.topItems.length > 0 && (
                  <div>
                    <p className={labelCls}>Top items by value</p>
                    <div className="space-y-1.5 mt-2">
                      {r.topItems.map((item, idx) => (
                        <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                          <span className="text-xs font-bold text-gray-300 w-4 shrink-0">{idx + 1}</span>
                          <span className="text-xs font-medium text-gray-700 flex-1 truncate">{item.name}</span>
                          <span className="text-xs font-semibold text-gray-900 shrink-0">£{(item.totalValue || 0).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 px-5 sm:px-6 py-4 border-t border-gray-100 shrink-0">
                <button onClick={() => setShowReports(false)} className="px-5 py-2.5 border border-gray-200 text-gray-600 font-semibold text-sm rounded-xl hover:bg-gray-50 transition-all cursor-pointer">
                  Close
                </button>
                <button onClick={handleExportReport} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer active:scale-95">
                  <Download className="w-4 h-4" />
                  Export Report
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Adjust Stock Modal ── */}
      {adjustingItem && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setAdjustingItem(null)} />
          <div className="relative w-full sm:max-w-sm bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
            <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>
            <div className="flex items-center justify-between px-5 sm:px-6 py-5 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Adjust stock</h2>
                <p className="text-xs text-gray-500 mt-0.5">{adjustingItem.name} · currently {adjustingItem.quantity} {adjustingItem.unit}</p>
              </div>
              <button onClick={() => setAdjustingItem(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-all cursor-pointer">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
              <div>
                <label className={labelCls}>Type</label>
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  {([
                    { value: 'IN', label: 'Stock in' },
                    { value: 'OUT', label: 'Stock out' },
                    { value: 'ADJUSTMENT', label: 'Set to' },
                  ] as const).map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAdjustType(opt.value)}
                      className={`py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                        adjustType === opt.value
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-white border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelCls}>
                  {adjustType === 'ADJUSTMENT' ? 'New quantity' : 'Quantity'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(e.target.value)}
                  placeholder="0"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Reason <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Received shipment, damaged goods, stocktake"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-5 sm:px-6 py-4 border-t border-gray-100 shrink-0">
              <button onClick={() => setAdjustingItem(null)} className="px-5 py-2.5 border border-gray-200 text-gray-600 font-semibold text-sm rounded-xl hover:bg-gray-50 transition-all cursor-pointer">
                Cancel
              </button>
              <button
                onClick={handleAdjustStock}
                disabled={adjustSubmitting || !adjustQuantity}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-all cursor-pointer active:scale-95"
              >
                {adjustSubmitting ? 'Saving…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Item Detail Modal ── */}
      {selectedItem && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 sm:pl-0 md:pl-64">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setSelectedItem(null)} />
          <div className="relative w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
            {/* Handle */}
            <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-wider">{selectedItem.sku}</p>
                  <h2 className="text-base font-black text-gray-900 leading-tight">{selectedItem.name}</h2>
                </div>
              </div>
              <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-all cursor-pointer">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[11px] font-black uppercase tracking-wider rounded-full">
                  {selectedItem.category}
                </span>
                {(() => {
                  const sc = getStatusConfig(selectedItem.status);
                  return (
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black ${sc.bg} ${sc.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {sc.label}
                    </span>
                  );
                })()}
              </div>

              {selectedItem.description && (
                <p className="text-sm text-gray-500 leading-relaxed">{selectedItem.description}</p>
              )}

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: 'In Stock', value: `${selectedItem.quantity} ${selectedItem.unit}`, icon: Boxes, iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600' },
                  { label: 'Total Value', value: `£${selectedItem.totalValue.toLocaleString()}`, icon: DollarSign, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
                  { label: 'Min / Max', value: `${selectedItem.minStock} / ${selectedItem.maxStock}`, icon: Activity, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
                  { label: 'Reorder At', value: String(selectedItem.reorderPoint), icon: Target, iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-2xl">
                    <div className={`p-2 rounded-lg ${stat.iconBg} shrink-0`}>
                      <stat.icon className={`w-3.5 h-3.5 ${stat.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{stat.label}</p>
                      <p className="text-sm font-black text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Location + Supplier */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3.5 bg-white border border-gray-100 rounded-2xl">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Location</p>
                  </div>
                  <p className="text-sm font-black text-gray-900">{selectedItem.location}</p>
                </div>
                <div className="p-3.5 bg-white border border-gray-100 rounded-2xl">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Supplier</p>
                  </div>
                  <p className="text-sm font-black text-gray-900">{selectedItem.supplier}</p>
                </div>
              </div>

              {/* Last restocked */}
              <div className="flex items-center justify-between p-3.5 bg-white border border-gray-100 rounded-2xl">
                <div className="flex items-center gap-2">
                  <History className="w-3.5 h-3.5 text-indigo-400" />
                  <p className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Last Restocked</p>
                </div>
                <p className="text-sm font-black text-gray-900">
                  {selectedItem.lastRestocked instanceof Date && !isNaN(selectedItem.lastRestocked.getTime())
                    ? selectedItem.lastRestocked.toLocaleDateString()
                    : 'Never'}
                </p>
              </div>

              {/* Tags */}
              {selectedItem.tags && selectedItem.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedItem.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-wider rounded-lg">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Print label */}
              <button
                onClick={() => generateLabelsPDF([selectedItem])}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-white text-[11px] font-black uppercase tracking-wider rounded-xl hover:bg-indigo-600 transition-all cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                Print Label
              </button>
            </div>

            {/* Footer */}
            <div className="px-5 sm:px-6 py-4 border-t border-gray-100 flex gap-2.5 shrink-0">
              <button
                onClick={() => openAdjustStock(selectedItem)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-wider rounded-xl hover:bg-indigo-700 transition-all cursor-pointer"
              >
                <ArrowUpDown className="w-4 h-4" />
                Adjust Stock
              </button>
              <button
                onClick={() => { setDeletingItem(selectedItem); setShowDeleteModal(true); }}
                className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all cursor-pointer border border-red-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Stock History Modal ── */}
      {showStockMovement && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 sm:pl-0 md:pl-64">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowStockMovement(false)} />
          <div className="relative w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
            <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-wider mb-0.5">Activity Log</p>
                <h2 className="text-lg font-black text-gray-900">Stock History</h2>
              </div>
              <button onClick={() => setShowStockMovement(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all cursor-pointer">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4">
              {stockMovements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <History className="w-8 h-8 text-gray-200" />
                  <p className="text-sm font-bold text-gray-400">No stock movements yet</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {stockMovements.map(movement => {
                    const isIn = movement.type === 'in';
                    return (
                      <div key={movement.id} className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-2xl">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isIn ? 'bg-emerald-100' : 'bg-red-100'}`}>
                          {isIn
                            ? <PackagePlus className="w-4 h-4 text-emerald-600" />
                            : <PackageMinus className="w-4 h-4 text-red-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-black text-gray-900 truncate">{movement.itemName}</p>
                            <span className={`text-sm font-black shrink-0 ${isIn ? 'text-emerald-600' : 'text-red-600'}`}>
                              {isIn ? '+' : '-'}{movement.quantity}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 mb-1">{movement.reason}</p>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400">
                            <span>
                              {movement.date instanceof Date && !isNaN(movement.date.getTime())
                                ? movement.date.toLocaleDateString()
                                : 'N/A'}
                            </span>
                            <span>·</span>
                            <span>{movement.user}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="px-5 sm:px-6 py-4 border-t border-gray-100 shrink-0">
              <button
                onClick={() => showNotify('Report downloaded', 'info')}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white text-[11px] font-black uppercase tracking-wider rounded-xl hover:bg-indigo-600 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Item Modal ── */}
      {showAddItem && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowAddItem(false)} />
          <div className="relative w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
            <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>
            <div className="flex items-center justify-between px-5 sm:px-6 py-5 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Add to inventory</h2>
                <p className="text-xs text-gray-500 mt-1">Fill in the product details to add it to your stock</p>
              </div>
              <button onClick={() => setShowAddItem(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all cursor-pointer">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1 space-y-1">
                  <label className={labelCls}>Item name *</label>
                  <input type="text" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} placeholder="e.g. Blue T-Shirt (Size M)" className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>SKU</label>
                  <input type="text" value={newItem.sku} onChange={(e) => setNewItem({...newItem, sku: e.target.value})} placeholder="Auto-generated" className={`${inputCls} font-mono`} />
                  <p className="text-[11px] text-gray-400">Auto-generated if left blank</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className={labelCls}>Category</label>
                  <select value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value})} className={`${inputCls} cursor-pointer appearance-none`}>
                    <option value="">Select</option>
                    {dynamicCategories.filter(c => c.id !== 'all').map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Quantity *</label>
                  <input type="number" value={newItem.quantity} onChange={(e) => setNewItem({...newItem, quantity: e.target.value})} placeholder="0" className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Unit</label>
                  <select value={newItem.unit} onChange={(e) => setNewItem({...newItem, unit: e.target.value})} className={`${inputCls} cursor-pointer appearance-none`}>
                    <option value="pcs">pcs</option>
                    <option value="kg">kg</option>
                    <option value="units">units</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className={labelCls}>Unit price *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">£</span>
                  <input
                    type="number"
                    step="0.01"
                    value={newItem.unitPrice}
                    onChange={(e) => setNewItem({...newItem, unitPrice: e.target.value})}
                    placeholder="0.00"
                    className={`${inputCls} pl-7`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={labelCls}>Supplier</label>
                  <select value={newItem.supplierId} onChange={(e) => setNewItem({...newItem, supplierId: e.target.value})} className={`${inputCls} cursor-pointer appearance-none`}>
                    <option value="">None</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Storage location</label>
                  <input type="text" value={newItem.location} onChange={(e) => setNewItem({...newItem, location: e.target.value})} placeholder="e.g. Shelf A, Row 3" className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={labelCls}>Min. stock</label>
                  <input type="number" value={newItem.minStock} onChange={(e) => setNewItem({...newItem, minStock: e.target.value})} placeholder="5" className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Max. stock</label>
                  <input type="number" value={newItem.maxStock} onChange={(e) => setNewItem({...newItem, maxStock: e.target.value})} placeholder="100" className={inputCls} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-5 sm:px-6 py-4 border-t border-gray-100 shrink-0 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:pb-4">
              <button
                onClick={() => setShowAddItem(false)}
                className="px-5 py-2.5 border border-gray-200 text-gray-600 font-semibold text-sm rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                className="px-6 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 transition-all cursor-pointer active:scale-95"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {deletingItem && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setDeletingItem(null); }}
          onConfirm={handleDeleteItem}
          title="Delete Inventory Item"
          itemName={deletingItem.name}
          itemDetails={`SKU: ${deletingItem.sku} - Qty: ${deletingItem.quantity} ${deletingItem.unit}`}
          warningMessage="This will permanently remove this item from your inventory records."
        />
      )}

      {/* ── Toast ── */}
      {notification && (
        <div className="fixed bottom-24 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-80 z-200 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-xl border ${
            notification.type === 'success'
              ? 'bg-emerald-600 border-emerald-500 text-white'
              : 'bg-gray-900 border-gray-700 text-white'
          }`}>
            <div className="p-1.5 rounded-lg bg-white/20 shrink-0">
              {notification.type === 'success' ? <Check className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
            </div>
            <p className="text-sm font-black">{notification.message}</p>
          </div>
        </div>
      )}

    </div>
  );
}
