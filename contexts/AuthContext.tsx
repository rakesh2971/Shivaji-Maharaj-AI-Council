import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { AuthService } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = AuthService.getAuthInstance();
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (u) => {
        // If we have a real firebase user, use it.
        if (u) {
          setUser(u);
        } else {
          // If firebase says logged out, but we are not in guest mode, clear user.
          // Note: Guest mode is manual, so onAuthStateChanged returning null 
          // shouldn't auto-logout a manually set guest user if we were persisting it,
          // but here we treat firebase as source of truth unless we explicitly set guest.
          setUser((prev) => (prev?.uid === 'guest-user' ? prev : null));
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async () => {
    try {
      await AuthService.signInWithGoogle();
    } catch (e: any) {
      console.error("Sign in failed", e);
      
      // Handle Unauthorized Domain (common in previews) or generic config errors
      if (e?.code === 'auth/unauthorized-domain' || e?.code === 'auth/operation-not-allowed') {
        console.warn("Domain not authorized by Firebase. Falling back to Guest Mode.");
        
        // Create a Mock/Guest User
        const guestUser = {
          uid: 'guest-user',
          displayName: 'Guest Minister',
          email: 'guest@council.local',
          photoURL: null,
          emailVerified: true,
          isAnonymous: true,
          metadata: {},
          providerData: [],
          refreshToken: '',
          tenantId: null,
          delete: async () => {},
          getIdToken: async () => '',
          getIdTokenResult: async () => ({} as any),
          reload: async () => {},
          toJSON: () => ({}),
        } as unknown as User;
        
        setUser(guestUser);
      } else if (e?.code !== 'auth/popup-closed-by-user') {
        alert(`Sign in failed: ${e.message}`);
      }
    }
  };

  const signOut = async () => {
    try {
      if (user?.uid === 'guest-user') {
        setUser(null);
      } else {
        await AuthService.signOut();
      }
    } catch (e) {
      console.error("Sign out failed", e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};