// ─── Mattermost Integration Service ─────────────────────────────────────────
// Posts notifications to Mattermost channels via REST API v4.
// Docs: https://api.mattermost.com/

const MM_URL      = process.env.MATTERMOST_API_URL || 'https://chat.feendesk.com/api/v4';
const MM_TOKEN    = process.env.MATTERMOST_TOKEN   || '';
const MM_TEAM     = process.env.MATTERMOST_TEAM    || '';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MattermostMessage {
  channel_id?: string;       // Post to a specific channel ID
  channelName?: string;      // Or look up by name (requires team)
  message: string;
  props?: Record<string, unknown>;
}

export interface MattermostResult {
  success: boolean;
  postId?: string;
  error?: string;
}

interface MattermostChannel {
  id: string;
  name: string;
  display_name: string;
}

// ─── Internal Helpers ────────────────────────────────────────────────────────

function headers(): Record<string, string> {
  return {
    'Authorization': `Bearer ${MM_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

async function mmFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${MM_URL}${path}`;
  const res = await fetch(url, { ...options, headers: { ...headers(), ...options?.headers } });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Mattermost API ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

// ─── Channel Helpers ─────────────────────────────────────────────────────────

/** Look up a channel by name within the configured team */
async function getChannelByName(name: string): Promise<MattermostChannel | null> {
  if (!MM_TEAM) return null;

  try {
    // First get team ID from team name
    const team = await mmFetch<{ id: string }>(`/teams/name/${MM_TEAM}`);
    const channel = await mmFetch<MattermostChannel>(
      `/teams/${team.id}/channels/name/${name}`
    );
    return channel;
  } catch {
    console.warn(`⚠️ Mattermost channel "${name}" not found in team "${MM_TEAM}"`);
    return null;
  }
}

// Channel ID cache to avoid repeated lookups
const channelCache = new Map<string, string>();

async function resolveChannelId(channelName: string): Promise<string | null> {
  if (channelCache.has(channelName)) {
    return channelCache.get(channelName)!;
  }

  const channel = await getChannelByName(channelName);
  if (channel) {
    channelCache.set(channelName, channel.id);
    return channel.id;
  }
  return null;
}

// ─── Core Post ───────────────────────────────────────────────────────────────

/** Post a message to a Mattermost channel */
export async function postMessage(msg: MattermostMessage): Promise<MattermostResult> {
  if (!MM_TOKEN) {
    console.warn('Mattermost not configured. Set MATTERMOST_TOKEN env var.');
    return { success: false, error: 'Mattermost not configured' };
  }

  try {
    let channelId = msg.channel_id;

    if (!channelId && msg.channelName) {
      channelId = await resolveChannelId(msg.channelName) ?? undefined;
    }

    if (!channelId) {
      return { success: false, error: 'No channel_id or valid channelName provided' };
    }

    const post = await mmFetch<{ id: string }>('/posts', {
      method: 'POST',
      body: JSON.stringify({
        channel_id: channelId,
        message: msg.message,
        props: msg.props,
      }),
    });

    console.log('✅ Mattermost message posted:', post.id);
    return { success: true, postId: post.id };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ Mattermost post failed:', errorMsg);
    return { success: false, error: errorMsg };
  }
}

// ─── Pre-built Notification Templates ────────────────────────────────────────

/** Notify when an SME sends an email to a client */
export async function notifyEmailSent(opts: {
  channel?: string;
  senderName: string;
  recipientEmail: string;
  subject: string;
  businessName: string;
}): Promise<MattermostResult> {
  const message = [
    `#### 📧 Email Sent`,
    `| Field | Value |`,
    `|-------|-------|`,
    `| **From** | ${opts.senderName} (${opts.businessName}) |`,
    `| **To** | ${opts.recipientEmail} |`,
    `| **Subject** | ${opts.subject} |`,
    `| **Time** | ${new Date().toLocaleString('en-GB')} |`,
  ].join('\n');

  return postMessage({
    channelName: opts.channel || 'general',
    message,
  });
}

/** Notify when a new invoice is created */
export async function notifyInvoiceCreated(opts: {
  channel?: string;
  invoiceNumber: string;
  clientName: string;
  amount: string;
  businessName: string;
}): Promise<MattermostResult> {
  const message = [
    `#### 🧾 New Invoice Created`,
    `| Field | Value |`,
    `|-------|-------|`,
    `| **Invoice** | #${opts.invoiceNumber} |`,
    `| **Client** | ${opts.clientName} |`,
    `| **Amount** | ${opts.amount} |`,
    `| **Business** | ${opts.businessName} |`,
  ].join('\n');

  return postMessage({
    channelName: opts.channel || 'accounting',
    message,
  });
}

/** Notify when a helpdesk ticket is opened */
export async function notifyTicketCreated(opts: {
  channel?: string;
  ticketSubject: string;
  customerName: string;
  priority: string;
}): Promise<MattermostResult> {
  const priorityEmoji: Record<string, string> = {
    LOW: '🟢', MEDIUM: '🟡', HIGH: '🟠', URGENT: '🔴',
  };

  const message = [
    `#### 🎫 New Support Ticket`,
    `${priorityEmoji[opts.priority] || '⚪'} **Priority:** ${opts.priority}`,
    `**Subject:** ${opts.ticketSubject}`,
    `**Customer:** ${opts.customerName}`,
  ].join('\n');

  return postMessage({
    channelName: opts.channel || 'support',
    message,
  });
}

/** Notify when a task is assigned */
export async function notifyTaskAssigned(opts: {
  channel?: string;
  taskTitle: string;
  assignee: string;
  priority: string;
  dueDate?: string;
}): Promise<MattermostResult> {
  const message = [
    `#### ✅ Task Assigned`,
    `**Task:** ${opts.taskTitle}`,
    `**Assigned to:** ${opts.assignee}`,
    `**Priority:** ${opts.priority}`,
    opts.dueDate ? `**Due:** ${opts.dueDate}` : '',
  ].filter(Boolean).join('\n');

  return postMessage({
    channelName: opts.channel || 'general',
    message,
  });
}

/** Notify when a new contact/lead is added to CRM */
export async function notifyNewLead(opts: {
  channel?: string;
  contactName: string;
  company?: string;
  source?: string;
}): Promise<MattermostResult> {
  const message = [
    `#### 👤 New Lead Added`,
    `**Name:** ${opts.contactName}`,
    opts.company ? `**Company:** ${opts.company}` : '',
    opts.source ? `**Source:** ${opts.source}` : '',
  ].filter(Boolean).join('\n');

  return postMessage({
    channelName: opts.channel || 'crm',
    message,
  });
}

/** Send a custom notification */
export async function notifyCustom(
  channel: string,
  title: string,
  body: string,
  emoji: string = '🔔',
): Promise<MattermostResult> {
  return postMessage({
    channelName: channel,
    message: `#### ${emoji} ${title}\n${body}`,
  });
}
