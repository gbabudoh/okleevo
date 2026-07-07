---
title: Inventory User Guide
summary: Step-by-step instructions for managing stock.
---

## Adding an item

1. Click **Add Item**.
2. Fill in Item name (required), SKU (auto-generated if left blank), Category, Quantity (required), Unit (pcs/kg/units), Unit price (required), Supplier (or "None"), Storage location, and Min./Max. stock levels (default to 5 and 100 if left blank).
3. Click **Add Item**. If the item starts at or below its reorder point, you'll get a low-stock notification immediately.

## Adjusting stock

The **Adjust** button shown directly on a grid card is not yet wired up — to actually adjust stock, use the card's **"⋮" menu → Adjust Stock**, or open the item's detail view and use its **Adjust Stock** button there.

In the Adjust Stock modal:
- **Stock in** — adds the quantity you enter to the current count.
- **Stock out** — subtracts the quantity (never goes below zero).
- **Set to** — enters an absolute quantity, useful after a physical stocktake.
- Add an optional Reason (e.g. "Received shipment", "damaged goods", "stocktake").

Every adjustment is logged as a stock movement, and status (In Stock / Low Stock / Out of Stock / Overstocked) recalculates automatically. You'll only get a fresh low-stock notification the moment an item newly crosses into Low Stock or Out of Stock — not repeatedly while it stays there.

## Viewing stock history

Use the **Stock History** quick action (or an item's menu) to see the 20 most recent movements across all items, including who made the change and why.

## Checking low stock alerts

The **Low Stock Alerts** quick action lists every item currently at Low Stock or Out of Stock, with out-of-stock items shown first. Click an alert to jump straight to that item.

## Running a report

The **Reports** quick action shows total value, total units, total products, a value breakdown by category, a stock-status breakdown, and your top 5 items by value — with an Export Report button to download it as CSV.

## Printing barcode labels

Use **Print Labels** (header quick action, for all currently filtered items) or an individual item's menu (for just that one) to generate a PDF sheet of CODE128 barcode labels.

## Importing and exporting via CSV

**Export CSV** downloads your currently filtered items. **Import CSV** matches uploaded rows to existing items by SKU — a matching SKU updates that item, and a new SKU creates a new one; you'll see a summary of how many were created, updated, or failed.

## Deleting an item

Use the "⋮" menu or the item's detail view, then confirm in the delete dialog. This is permanent.
