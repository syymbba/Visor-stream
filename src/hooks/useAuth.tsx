import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { auth, onAuthStateChanged, User } from '../firebase';
import { getUserProfile, UserProfile } from '../services/userService';

interface AuthContextValue {
  currentUser: User | null;
  userProfile: UserProfile | null;
  authChecked: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Single source of truth for Firebase auth state across the app. Subscribes
 * to `onAuthStateChanged` exactly once and fetches/refreshes the Firestore
 * user profile alongside it, replacing the three (formerly four) duplicate
 * subscriptions that used to live in App.tsx, Navbar.tsx, SettingsView.tsx
 * and LivePlayerView.tsx.
 */
export function AuthProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const refreshProfile = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      setUserProfile(null);
      return;
    }
    try {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
    } catch (err) {
      console.error('Error loading user profile:', err);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (err) {
          console.error('Error loading user profile:', err);
        }
      } else {
        setUserProfile(null);
      }
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  const value: AuthContextValue = { currentUser, userProfile, authChecked, refreshProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth() must be called within an <AuthProvider>.');
  }
  return ctx;
}
