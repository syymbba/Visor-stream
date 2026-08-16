import { getAccessToken } from './googleAuth';

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  snippet: string;
  from: string;
  fromName: string;
  fromEmail: string;
  to: string;
  subject: string;
  date: string;
  timestamp: number;
  labelIds: string[];
  isUnread: boolean;
  isStarred: boolean;
}

export interface GmailMessageDetail extends GmailMessageSummary {
  bodyText: string;
  bodyHtml: string;
  hasAttachments: boolean;
  attachments: { filename: string; mimeType: string; size: number }[];
}

export interface GmailLabel {
  id: string;
  name: string;
  type: string;
  messagesTotal?: number;
  messagesUnread?: number;
}

export interface SendEmailPayload {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
  threadId?: string;
}

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

// Base64URL encode string for RFC 2822 email payload
function base64UrlEncode(str: string): string {
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Decode base64url string to text
function decodeBase64Url(data: string): string {
  try {
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch (err) {
    return '';
  }
}

// Parse email header value
function getHeader(headers: { name: string; value: string }[] | undefined, name: string): string {
  if (!headers) return '';
  const header = headers.find((h) => h.name.toLowerCase() === name.toLowerCase());
  return header ? header.value : '';
}

// Extract sender name and clean email
function parseFromHeader(fromStr: string): { name: string; email: string } {
  if (!fromStr) return { name: 'Unknown', email: '' };
  const match = fromStr.match(/(.*?)(?:<(.+?)>|$)/);
  if (match) {
    const name = match[1]?.trim().replace(/^["']|["']$/g, '') || match[2] || fromStr;
    const email = match[2]?.trim() || match[1]?.trim() || '';
    return { name: name || 'Sender', email };
  }
  return { name: fromStr, email: fromStr };
}

// Recursively parse message parts for plaintext and HTML bodies
function extractBodyFromPayload(payload: any): { text: string; html: string; attachments: any[] } {
  let text = '';
  let html = '';
  const attachments: any[] = [];

  if (!payload) return { text, html, attachments };

  if (payload.body?.data) {
    const decoded = decodeBase64Url(payload.body.data);
    if (payload.mimeType?.includes('html')) {
      html = decoded;
    } else {
      text = decoded;
    }
  }

  if (payload.filename && payload.body?.attachmentId) {
    attachments.push({
      filename: payload.filename,
      mimeType: payload.mimeType,
      size: payload.body.size || 0,
    });
  }

  if (payload.parts && Array.isArray(payload.parts)) {
    for (const part of payload.parts) {
      const nested = extractBodyFromPayload(part);
      if (nested.text && !text) text = nested.text;
      if (nested.html && !html) html = nested.html;
      attachments.push(...nested.attachments);
    }
  }

  return { text, html, attachments };
}

export const gmailService = {
  // Fetch user labels
  async getLabels(): Promise<GmailLabel[]> {
    const token = await getAccessToken();
    if (!token) throw new Error('No access token available. Please authenticate with Google.');

    const res = await fetch(`${GMAIL_API_BASE}/labels`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to fetch labels (${res.status})`);
    }

    const data = await res.json();
    return data.labels || [];
  },

  // List messages by label or query
  async listMessages(options: {
    labelIds?: string[];
    query?: string;
    maxResults?: number;
    pageToken?: string;
  } = {}): Promise<{ messages: GmailMessageSummary[]; nextPageToken?: string; totalEstimated?: number }> {
    const token = await getAccessToken();
    if (!token) throw new Error('No access token available. Please authenticate with Google.');

    const params = new URLSearchParams();
    if (options.labelIds && options.labelIds.length > 0) {
      options.labelIds.forEach((id) => params.append('labelIds', id));
    }
    if (options.query) params.append('q', options.query);
    if (options.maxResults) params.append('maxResults', options.maxResults.toString());
    else params.append('maxResults', '20');
    if (options.pageToken) params.append('pageToken', options.pageToken);

    const listRes = await fetch(`${GMAIL_API_BASE}/messages?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!listRes.ok) {
      const err = await listRes.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to list messages (${listRes.status})`);
    }

    const listData = await listRes.json();
    const rawMessages = listData.messages || [];

    if (rawMessages.length === 0) {
      return { messages: [], nextPageToken: undefined, totalEstimated: 0 };
    }

    // Fetch message summaries in parallel (with batching)
    const detailPromises = rawMessages.slice(0, 20).map(async (msg: { id: string; threadId: string }) => {
      try {
        const msgRes = await fetch(
          `${GMAIL_API_BASE}/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Date`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!msgRes.ok) return null;
        const msgData = await msgRes.json();
        const headers = msgData.payload?.headers || [];
        const fromRaw = getHeader(headers, 'From');
        const { name: fromName, email: fromEmail } = parseFromHeader(fromRaw);

        const summary: GmailMessageSummary = {
          id: msgData.id,
          threadId: msgData.threadId,
          snippet: msgData.snippet || '',
          from: fromRaw,
          fromName,
          fromEmail,
          to: getHeader(headers, 'To'),
          subject: getHeader(headers, 'Subject') || '(No Subject)',
          date: getHeader(headers, 'Date'),
          timestamp: parseInt(msgData.internalDate || Date.now().toString(), 10),
          labelIds: msgData.labelIds || [],
          isUnread: (msgData.labelIds || []).includes('UNREAD'),
          isStarred: (msgData.labelIds || []).includes('STARRED'),
        };
        return summary;
      } catch (e) {
        return null;
      }
    });

    const results = await Promise.all(detailPromises);
    const validMessages = results.filter((m): m is GmailMessageSummary => m !== null);

    return {
      messages: validMessages,
      nextPageToken: listData.nextPageToken,
      totalEstimated: listData.resultSizeEstimate,
    };
  },

  // Fetch full message detail
  async getMessageDetail(messageId: string): Promise<GmailMessageDetail> {
    const token = await getAccessToken();
    if (!token) throw new Error('No access token available. Please authenticate with Google.');

    const res = await fetch(`${GMAIL_API_BASE}/messages/${messageId}?format=full`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to fetch message detail (${res.status})`);
    }

    const data = await res.json();
    const headers = data.payload?.headers || [];
    const fromRaw = getHeader(headers, 'From');
    const { name: fromName, email: fromEmail } = parseFromHeader(fromRaw);
    const { text, html, attachments } = extractBodyFromPayload(data.payload);

    return {
      id: data.id,
      threadId: data.threadId,
      snippet: data.snippet || '',
      from: fromRaw,
      fromName,
      fromEmail,
      to: getHeader(headers, 'To'),
      subject: getHeader(headers, 'Subject') || '(No Subject)',
      date: getHeader(headers, 'Date'),
      timestamp: parseInt(data.internalDate || Date.now().toString(), 10),
      labelIds: data.labelIds || [],
      isUnread: (data.labelIds || []).includes('UNREAD'),
      isStarred: (data.labelIds || []).includes('STARRED'),
      bodyText: text,
      bodyHtml: html,
      hasAttachments: attachments.length > 0,
      attachments,
    };
  },

  // Send an email (RFC 2822 format)
  async sendEmail(payload: SendEmailPayload): Promise<{ id: string; threadId: string }> {
    const token = await getAccessToken();
    if (!token) throw new Error('No access token available. Please authenticate with Google.');

    const emailLines: string[] = [
      `To: ${payload.to}`,
      `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(payload.subject)))}?=`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
    ];

    if (payload.cc) emailLines.push(`Cc: ${payload.cc}`);
    if (payload.bcc) emailLines.push(`Bcc: ${payload.bcc}`);

    // Format body into HTML with paragraph breaks
    const formattedBody = payload.body.includes('<') && payload.body.includes('>')
      ? payload.body
      : `<div style="font-family: sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b;">
          ${payload.body.replace(/\n/g, '<br/>')}
          <br/><br/>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;"/>
          <p style="font-size: 11px; color: #64748b;">
            Sent from <strong>Visor Stream Broadcaster Studio</strong> • Gaming & Esports Platform
          </p>
        </div>`;

    const bodyBase64 = btoa(unescape(encodeURIComponent(formattedBody)));
    emailLines.push('', bodyBase64);

    const rawEmail = emailLines.join('\r\n');
    const encodedRaw = base64UrlEncode(rawEmail);

    const bodyPayload: any = { raw: encodedRaw };
    if (payload.threadId) {
      bodyPayload.threadId = payload.threadId;
    }

    const res = await fetch(`${GMAIL_API_BASE}/messages/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyPayload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to send email (${res.status})`);
    }

    return await res.json();
  },

  // Modify Labels (e.g. Star, Mark Read/Unread)
  async modifyLabels(messageId: string, addLabelIds: string[], removeLabelIds: string[]): Promise<void> {
    const token = await getAccessToken();
    if (!token) throw new Error('No access token available.');

    const res = await fetch(`${GMAIL_API_BASE}/messages/${messageId}/modify`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        addLabelIds,
        removeLabelIds,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to update labels (${res.status})`);
    }
  },

  // Move to Trash
  async trashMessage(messageId: string): Promise<void> {
    const token = await getAccessToken();
    if (!token) throw new Error('No access token available.');

    const res = await fetch(`${GMAIL_API_BASE}/messages/${messageId}/trash`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to trash message (${res.status})`);
    }
  },

  // Permanently Delete Message
  async deleteMessagePermanently(messageId: string): Promise<void> {
    const token = await getAccessToken();
    if (!token) throw new Error('No access token available.');

    const res = await fetch(`${GMAIL_API_BASE}/messages/${messageId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to permanently delete email (${res.status})`);
    }
  },
};
