import type { Step } from 'react-joyride';

export const mailboxTourSteps: Step[] = [
  {
    target: '#tour-mailbox-header',
    title: 'Okleevo Mailbox & Postal Engine',
    content: 'Manage inbound customer emails, compose outbound messages, and track delivery status.',
    skipBeacon: true,
  },
  {
    target: '#tour-mailbox-compose',
    title: 'Compose Email',
    content: 'Send trackable emails with rich formatting, attachments, and verified domain signatures.',
    skipBeacon: true,
  },
  {
    target: '#tour-mailbox-folders',
    title: 'Mail Folders & Tabs',
    content: 'Filter between Inbox, Sent, Drafts, Archived, and Spam messages.',
    skipBeacon: true,
  },
];
