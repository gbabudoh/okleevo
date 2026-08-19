// ─── Real-time chat push (Pusher) ───────────────────────────────────────────
// Layer 1 only (authenticated Virtual HQ team chat) — nothing here is
// reachable from or related to the Layer 2 guest surface.
//
// Deliberately a managed pub/sub service rather than a self-hosted
// WebSocket server: Vercel serverless can't hold long-lived connections,
// and Phase 3 already added one stateful service (ClamAV + the malware-scan
// worker) to the VPS side — this avoids adding a second.
//
// Design: Pusher only ever carries a "something changed" signal, never the
// message content itself. The client reacts by re-fetching from the
// existing REST endpoint (app/api/collaboration/chat), which stays the
// single source of truth for message data and permissions. If Pusher isn't
// configured, every function here is a no-op and chat keeps working exactly
// as it did before — via polling — with zero behavior change.

import Pusher from 'pusher';

function getPusherServerClient(): Pusher | null {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER;
  if (!appId || !key || !secret || !cluster) return null;
  return new Pusher({ appId, key, secret, cluster, useTLS: true });
}

export function isRealtimeConfigured(): boolean {
  return Boolean(
    process.env.PUSHER_APP_ID && process.env.PUSHER_KEY && process.env.PUSHER_SECRET && process.env.PUSHER_CLUSTER
  );
}

/** Deterministic private channel name for a 1:1 conversation, order-independent. */
export function chatChannelName(userIdA: string, userIdB: string): string {
  const [a, b] = [userIdA, userIdB].sort();
  return `private-chat-${a}-${b}`;
}

/** Signals that a new message exists in this conversation — carries no message content. */
export async function triggerNewChatMessage(senderId: string, receiverId: string): Promise<void> {
  const client = getPusherServerClient();
  if (!client) return; // Not configured — the client's polling fallback still covers this.
  try {
    await client.trigger(chatChannelName(senderId, receiverId), 'new-message', {});
  } catch (error) {
    console.error('Failed to publish chat realtime event (non-fatal, chat still works via polling):', error);
  }
}

/** Authorizes a user to subscribe to a private chat channel — see app/api/pusher/auth. */
export function authorizeChatChannel(userId: string, socketId: string, channelName: string): Pusher.ChannelAuthResponse | null {
  const client = getPusherServerClient();
  if (!client) return null;

  const match = channelName.match(/^private-chat-([^-]+)-([^-]+)$/);
  if (!match || !match.slice(1).includes(userId)) return null;

  return client.authorizeChannel(socketId, channelName);
}
