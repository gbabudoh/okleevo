---
title: Inventory FAQ
summary: Common questions and troubleshooting for Inventory.
---

## I clicked "Adjust" on a card and nothing happened — why?

The quick **Adjust** button shown directly on a grid card isn't wired up yet. Use the card's "⋮" menu → **Adjust Stock**, or open the item and use the Adjust Stock button in its detail view.

## Why didn't I get another low-stock alert for an item that's still low?

Alerts fire the moment an item newly crosses into Low Stock or Out of Stock, not every time you view it — this avoids repeated notifications for the same ongoing shortage.

## What's the difference between "Stock in/out" and "Set to" when adjusting?

Stock in/out adds or subtracts a quantity from the current count. "Set to" replaces the count entirely with the number you enter — use it after a physical stocktake rather than trying to calculate the difference yourself.

## Can I sync inventory with Shopify?

Not currently available in this environment — the feature exists in the codebase but is switched off until real store credentials are configured.

## What happens if I import a CSV with a SKU that already exists?

That row updates the existing item rather than creating a duplicate, so re-importing an updated spreadsheet is safe.

## Why does an item show its supplier as "In-house"?

That's the default label shown when an item isn't linked to a specific supplier record.
