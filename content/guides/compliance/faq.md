---
title: Compliance FAQ
summary: Common questions and troubleshooting for Compliance.
---

## Why can't I add a framework or see anything on the Frameworks tab?

There isn't a way to add a framework through the UI yet, so this tab will show as empty for now — it's a placeholder for upcoming functionality.

## Why is the Audits tab always empty?

Audit logging isn't wired up to any data source yet, so "Recent Audit Activities" and "Upcoming Audits" will show as empty regardless of your items.

## I edited an item's priority/assignee, but it reverted after I reloaded — why?

Only Title, Description, Category, Due Date, and Status are currently saved when you edit an item. Other fields you set in the Edit form aren't persisted yet, so they'll reset to their defaults on your next visit.

## Does Okleevo automatically remind me about upcoming compliance deadlines?

Not yet — there's no automated reminder running behind the scenes today, so it's worth checking the Overview and Items tabs yourself on a regular basis.

## Why did an item I marked "Mark Compliant" show an unexpected status afterward?

There's a known display quirk where a freshly completed item can show as an unrecognised status rather than "Compliant" right after marking it — the item is still saved as complete; this is a display issue we're aware of.

## Can I duplicate an item and keep the copy permanently?

A duplicate is created for your current session — to keep it, make sure to finish editing it and note that a page refresh will clear the copy since it isn't saved through the duplicate action itself.
