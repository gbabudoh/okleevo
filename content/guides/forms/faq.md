---
title: Forms FAQ
summary: Common questions and troubleshooting for Forms.
---

## Why can't people submit my form?

Only forms with status **Active** are reachable at their public link — Draft and Closed forms show as "not found" to visitors, even if you share the direct URL.

## Does "Export Data" give me every response?

No — it downloads a short summary CSV (form name, total responses, field count) rather than a row for every individual submission.

## Can I add options to a Dropdown field?

The current field builder doesn't have a way to add dropdown options from the UI — a Dropdown field will show up without selectable choices unless it's configured another way.

## What happens if my webhook fails?

A failed webhook doesn't affect the submission itself — the response is still saved in Okleevo regardless of whether the webhook succeeds.

## What happens to responses if I delete a form?

They're deleted along with it — deleting a form permanently removes every response it collected, so make sure you've exported anything you need first.

## Can I edit which fields are on a form after creating it?

Not from the Edit modal — that's for the form's name, description, category, status, and webhook. The field list is set when the form is created.
