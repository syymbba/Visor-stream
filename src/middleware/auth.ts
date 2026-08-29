import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    // `checkRevoked: true` forces an extra check against Firebase's revocation
    // list so a disabled/deleted account or a token invalidated by a password
    // reset can't keep authenticating with a still-unexpired ID token.
    const decodedToken = await adminAuth.verifyIdToken(token, true);
    req.user = decodedToken;
    next();
  } catch (error: any) {
    if (error?.code === 'auth/id-token-revoked') {
      return res.status(401).json({ error: 'Unauthorized: Session has been revoked. Please sign in again.' });
    }
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
