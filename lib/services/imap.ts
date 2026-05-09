import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';

/**
 * IMAP Service for Okleevo Business Inbox
 * This handles connecting to the SME's VPS mailbox to fetch incoming emails.
 */

interface ImapConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export async function fetchInboxMessages(config: ImapConfig, limit: number = 20) {
  const client = new ImapFlow({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.auth.user,
      pass: config.auth.pass
    },
    logger: false
  });

  try {
    await client.connect();

    // Select the INBOX folder
    const lock = await client.getMailboxLock('INBOX');
    try {
      // Fetch the last 'limit' messages
      const messages = [];
      
      // We search for ALL messages and then take the last N
      // This is simpler for a basic implementation
      const uids = await client.search({ all: true });
      if (!uids) return { success: true, messages: [] };
      const targetUids = uids.slice(-limit).reverse();

      for (const uid of targetUids) {
        const message = await client.fetchOne(uid.toString(), { source: true });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parsed = await simpleParser((message as any).source);
        
        messages.push({
          uid: uid,
          messageId: parsed.messageId,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          from: (parsed.from as any)?.text || '',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          to: (parsed.to as any)?.text || '',
          subject: parsed.subject || '(No Subject)',
          date: parsed.date || new Date(),
          body: parsed.text || '',
          html: parsed.html || parsed.textAsHtml || '',
          hasAttachments: parsed.attachments && parsed.attachments.length > 0,
          attachments: parsed.attachments?.map(a => ({
            filename: a.filename,
            contentType: a.contentType,
            size: a.size
          }))
        });
      }

      return { success: true, messages };
    } finally {
      lock.release();
    }
  } catch (error) {
    console.error('IMAP Fetch Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to connect to IMAP' };
  } finally {
    await client.logout();
  }
}
