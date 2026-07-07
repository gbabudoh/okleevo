---
title: Inventory Tutorials
summary: Full workflows for common inventory scenarios.
---

## Tutorial: Receiving a new shipment

1. Find the item (or add it if it's new to your catalogue).
2. Open its "⋮" menu → **Adjust Stock** → choose **Stock in**, enter the quantity received, and add a reason like "Received shipment from {supplier}".
3. Confirm — the item's quantity, status, and stock history all update immediately.

## Tutorial: Reconciling after a physical stocktake

1. Count the actual quantity on the shelf.
2. Open **Adjust Stock** for the item, choose **Set to**, and enter the counted quantity as "New quantity".
3. Add a reason like "stocktake correction" so the history shows why the number changed.

## Tutorial: Staying ahead of stockouts

1. Set a sensible **Min. stock** / reorder point when adding each item.
2. Periodically check the **Low Stock Alerts** quick action, or watch for the low-stock notification that fires the moment an item crosses its threshold.
3. Place a restock order with the relevant supplier, then log the stock-in adjustment once it arrives.

## Tutorial: Preparing labels for a new batch of products

1. Add or update the items in question.
2. Filter the list down to just those items (search or category filter).
3. Click **Print Labels** to generate a barcode label sheet ready to print and apply.

## Tutorial: Migrating a spreadsheet of stock into Okleevo

1. Prepare a CSV with columns matching Okleevo's export format (Name, SKU, Category, Quantity, Unit, Price, Location, Min Stock, Max Stock).
2. Use **Import CSV** — items with a SKU that already exists will be updated rather than duplicated, so it's safe to re-import an updated sheet later.
3. Check the summary toast for how many rows were created, updated, or failed.
