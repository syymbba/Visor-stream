import type { DecodedIdToken } from 'firebase-admin/auth';
import { adminAuth } from '../src/lib/firebase-admin';

export async function authenticateApiRequest(req: any, res: any): Promise<DecodedIdToken | null> {
  const header = req.headers.authorization;
  if (typeof header !== 'string' || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  try {
    return await adminAuth.verifyIdToken(header.slice('Bearer '.length));
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
}

export function setPrivateCors(req: any, res: any): void {
  const configuredOrigin = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
  const requestOrigin = req.headers.origin;
  if (configuredOrigin && requestOrigin === configuredOrigin) {
    res.setHeader('Access-Control-Allow-Origin', configuredOrigin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
}
