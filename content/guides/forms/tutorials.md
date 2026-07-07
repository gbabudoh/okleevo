---
title: Forms Tutorials
summary: Full workflows for building and sharing a form.
---

## Tutorial: Building a contact form

1. Click **Create Form**, name it "Contact Us", set Category to Contact, and set Status to Active.
2. Add fields: Name (Short Text, required), Email (Email, required), Message (Long Text, required).
3. Click **Create Form**, then use **Copy Link** to grab the public URL and add it to your website or share it directly.

## Tutorial: Collecting event RSVPs

1. Create a form with Category "Event", add fields like Name, Email, and a Dropdown field for "Which session are you attending?".
2. Publish it (Active status) and share the link in your invite.
3. Check back on the Forms grid to see the response count climb as people submit.

## Tutorial: Forwarding submissions to another system

1. Open an existing form's **Edit** modal.
2. Add a Webhook URL pointing at the endpoint you want to receive submissions.
3. Save — every new public submission will now also be posted to that webhook automatically, in addition to being saved in Okleevo.

## Tutorial: Taking a form offline temporarily

1. Open the form's **Edit** modal and change its Status to Draft or Closed.
2. The public link will stop accepting new responses immediately, while everything already collected stays intact.
