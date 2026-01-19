import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { SavedSimulation } from '../types';

// Casting to any to avoid "Property 'env' does not exist on type 'ImportMeta'" TS error
const env = (import.meta as any).env || {};

// Config uses Environment variables if available, otherwise falls back to the provided keys
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyB0TMqU753TInUDqT7ApN6HvKLVErkTsBE",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "astha-pradhan-mandal.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "astha-pradhan-mandal",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "astha-pradhan-mandal.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1014715902814",
  appId: env.VITE_FIREBASE_APP_ID || "1:1014715902814:web:5104d6ba27fab6418b7dcf"
};

let app, auth, db;
export let isFirebaseConfigured = false;

try {
  // We check if the apiKey is present (which it now is, due to the fallback)
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "mock-key") {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseConfigured = true;
  } else {
    console.warn("Firebase Config missing. Auth and History features will be disabled.");
  }
} catch (e) {
  console.error("Firebase Initialization Error:", e);
  isFirebaseConfigured = false;
}

export const AuthService = {
  signInWithGoogle: async () => {
    if (!isFirebaseConfigured || !auth) throw new Error("Firebase not configured");
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  },
  signOut: async () => {
    if (!isFirebaseConfigured || !auth) return;
    return firebaseSignOut(auth);
  },
  getAuthInstance: () => auth
};

export const HistoryService = {
  saveSimulation: async (userId: string, data: Omit<SavedSimulation, 'id' | 'userId' | 'date'>) => {
    // FALLBACK: Use LocalStorage if Firebase is down or User is Guest
    if (!isFirebaseConfigured || !db || userId === 'guest-user') {
      try {
        const localData = localStorage.getItem('astha_history');
        const history = localData ? JSON.parse(localData) : [];
        const newEntry = {
          id: `local-${Date.now()}`,
          userId,
          ...data,
          date: Date.now()
        };
        localStorage.setItem('astha_history', JSON.stringify([newEntry, ...history]));
      } catch (e) {
        console.error("LocalStorage Save Error:", e);
      }
      return;
    }

    // REAL: Firestore
    try {
      await addDoc(collection(db, 'simulations'), {
        userId,
        ...data,
        date: Date.now()
      });
    } catch (e) {
      console.error("Error saving history:", e);
    }
  },

  getHistory: async (userId: string): Promise<SavedSimulation[]> => {
    // FALLBACK: Use LocalStorage if Firebase is down or User is Guest
    if (!isFirebaseConfigured || !db || userId === 'guest-user') {
      try {
        const localData = localStorage.getItem('astha_history');
        const history = localData ? JSON.parse(localData) : [];
        return history.filter((h: any) => h.userId === userId);
      } catch (e) {
        return [];
      }
    }

    // REAL: Firestore
    try {
      const q = query(
        collection(db, 'simulations'),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedSimulation));
    } catch (e) {
      console.error("Error fetching history:", e);
      return [];
    }
  }
};