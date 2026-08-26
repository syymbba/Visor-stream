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
  bitrateCapKbps?: number;
  lowLatencyMode?: boolean;
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
  bitrateCapKbps: 6500,
  lowLatencyMode: true,
  userLevel: 24,
  userXp: 4850,
  chatFlair: '🔥 PRO CLUTCH',
};

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
    const dataToSave = {
      ...profile,
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
    return true;
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
