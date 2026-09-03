import { 
  db, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp, 
  handleFirestoreError, 
  OperationType 
} from '../firebase';
import { User } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  bio: string;
  networkProvider: 'mtn' | 'airtel' | 'mpesa' | 'card';
  mobileNumber: string;
  lowDataMode: boolean;
  notificationsEnabled: boolean;
  proGamerTier?: 'free' | 'fan' | 'pro' | 'legend';
  balanceUSD?: number;
  showBalanceInHeader?: boolean;
  privacyProfileVisibility?: 'public' | 'friends' | 'private';
  privacyDirectMessages?: 'everyone' | 'subs' | 'nobody';
  twoFactorEnabled?: boolean;
  blockedUsers?: string[];
  streamKey?: string;
  rtmpServer?: string;
  userLevel?: number;
  userXp?: number;
  chatFlair?: string;
  createdAt?: any;
  updatedAt?: any;
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  uid: 'guest',
  displayName: 'ProGamer_Elite',
  email: 'gamer@visorstream.com',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  bio: 'Apex Legends & PUBG Mobile competitor. Clan Captain @ VSR Squad.',
  networkProvider: 'mtn',
  mobileNumber: '+256 780 123 456',
  lowDataMode: false,
  notificationsEnabled: true,
  proGamerTier: 'free',
  balanceUSD: 0,
  showBalanceInHeader: true,
  privacyProfileVisibility: 'public',
  privacyDirectMessages: 'everyone',
  twoFactorEnabled: false,
  blockedUsers: ['toxic_troll99', 'spambot_ke'],
  streamKey: '',
  rtmpServer: 'rtmp://nbo-ingest.visorstream.com/live',
  userLevel: 24,
  userXp: 4850,
  chatFlair: '🔥 PRO CLUTCH',
};

/**
 * Fields the client is allowed to write directly to Firestore (must stay in sync
 * with the `hasOnly([...])` allow-lists in firestore.rules). `balanceUSD` and
 * `proGamerTier` are deliberately excluded here even though they exist on
 * UserProfile: they represent real money / paid-tier entitlements and are only
 * ever set by the trusted backend. `twoFactorEnabled` is also excluded because
 * it is now backend-authoritative (see /api/auth/2fa/*) rather than a client
 * boolean, so it must never be written from the browser. `streamKey` and
 * `rtmpServer` are legacy stream ingest fields superseded by the real Mux
 * `mux_live_streams` row (see GET/PATCH /api/streams/me); they stay out of
 * this list. The Adaptive Bitrate Cap control was removed entirely (Mux's
 * API has no way to cap a creator's outgoing OBS bitrate) and Ultra
 * Low-Latency Mode now maps to Mux's real per-stream `latencyMode`
 * (fetched/updated via useMyStream()), so neither lives on this profile
 * object anymore. `userLevel` and `userXp` gate creator rank/unlocks and are
 * backend-authoritative.
 */
const CLIENT_WRITABLE_PROFILE_FIELDS: readonly (keyof UserProfile)[] = [
  'uid', 'displayName', 'email', 'photoURL', 'bio', 'networkProvider',
  'mobileNumber', 'lowDataMode', 'notificationsEnabled',
  'privacyProfileVisibility', 'privacyDirectMessages', 'blockedUsers',
  'chatFlair', 'showBalanceInHeader',
];

function pickClientWritableFields(profile: Partial<UserProfile>): Partial<UserProfile> {
  const result: Partial<UserProfile> = {};
  for (const key of CLIENT_WRITABLE_PROFILE_FIELDS) {
    if (key in profile) {
      (result as any)[key] = (profile as any)[key];
    }
  }
  return result;
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, {
      operation: OperationType.READ,
      path: `users/${uid}`,
      authUid: uid,
      timestamp: new Date().toISOString()
    });
    return null;
  }
}

export const getUserProfile = fetchUserProfile;

export async function saveUserProfile(profile: UserProfile): Promise<boolean> {
  try {
    const docRef = doc(db, 'users', profile.uid);

    // Validate blockedUsers before writing: must be an array of strings with a
    // reasonable upper bound so a broken or malicious client cannot bloat the doc.
    if (profile.blockedUsers !== undefined) {
      if (!Array.isArray(profile.blockedUsers) || profile.blockedUsers.length > 500 ||
          profile.blockedUsers.some((id) => typeof id !== 'string' || id.length > 128)) {
        return false;
      }
    }

    const dataToSave = {
      // Only send fields the client is actually permitted to write. Sending
      // server-authoritative fields (balanceUSD, proGamerTier, twoFactorEnabled)
      // used to cause Firestore to silently reject the *entire* write because
      // firestore.rules rejects any update that touches a disallowed key.
      ...pickClientWritableFields(profile),
      uid: profile.uid,
      updatedAt: serverTimestamp()
    };
    await setDoc(docRef, dataToSave, { merge: true });

    return true;
  } catch (error) {
    handleFirestoreError(error, {
      operation: OperationType.UPDATE,
      path: `users/${profile.uid}`,
      authUid: profile.uid,
      timestamp: new Date().toISOString()
    });
    // Previously this returned `true` even on failure, so the UI would show a
    // "saved!" toast when the write had actually been rejected. Callers must
    // now check the return value and surface a real error to the user.
    return false;
  }
}

export async function syncAuthUserWithFirestore(user: User, additionalData?: Partial<UserProfile>): Promise<UserProfile> {
  try {
    const existing = await fetchUserProfile(user.uid);
    if (existing) {
      if (additionalData) {
        const updated = { ...existing, ...additionalData };
        await saveUserProfile(updated);
        return updated;
      }
      return existing;
    }

    const newProfile: UserProfile = {
      uid: user.uid,
      displayName: user.displayName || user.email?.split('@')[0] || 'VisorGamer',
      email: user.email || '',
      photoURL: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: 'Visor Stream Gamer & Creator',
      networkProvider: 'mtn',
      mobileNumber: '+256 780 123 456',
      lowDataMode: false,
      notificationsEnabled: true,
      proGamerTier: 'free',
      balanceUSD: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...additionalData
    };

    await saveUserProfile(newProfile);

    // Synchronize with Cloud SQL backend in background
    try {
      const token = await user.getIdToken();
      if (token) {
        fetch('/api/auth/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            displayName: newProfile.displayName,
            photoUrl: newProfile.photoURL,
          }),
        }).catch(() => {});
      }
    } catch {
      // Ignore background sync errors
    }

    return newProfile;
  } catch {
    const fallbackProfile: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      uid: user.uid,
      displayName: user.displayName || 'VisorGamer',
      email: user.email || '',
      photoURL: user.photoURL || DEFAULT_USER_PROFILE.photoURL
    };
    return fallbackProfile;
  }
}
