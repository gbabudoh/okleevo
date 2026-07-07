---
title: Tasks FAQ
summary: Common questions and troubleshooting for Tasks.
---

## Why did one of my tasks disappear from the board?

If the task is linked to a Project and that project's invoice becomes overdue, Okleevo automatically pauses the project's open tasks. A paused task doesn't have a column on the board, so it appears to vanish — check the linked project's invoice status if this happens.

## Can I assign a task to a specific team member from a list?

Not currently — "Assigned to" is a free-text name field, not a user picker. The Assignee filter is built from whatever names have already been typed into existing tasks.

## Why did my "Sort by Priority" or "Clear Completed" action undo itself?

Those two actions only reorder or hide cards for your current session — they don't change anything in the database. Refreshing the page restores the original order and any "completed" cards you cleared.

## How is a task's progress percentage calculated?

It's the share of subtasks marked complete. A task with no subtasks shows 100% once it's moved to Done, and 0% otherwise.

## Can I set a due time, not just a due date?

No — due dates are date-only; there's no time-of-day component.

## What's the difference between the quick arrow move and changing status in the detail view?

The arrow buttons move a task exactly one column at a time and apply instantly. The detail view's status selector lets you jump to any status, but first "stages" the change — you need to click **Apply** to confirm it, unless you use the **Mark as Done** shortcut, which applies immediately.
