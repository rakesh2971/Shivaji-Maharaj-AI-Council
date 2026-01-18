import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { SavedSimulation, AgentResponse } from '../types';

// NOTE: In a real environment, replace these with process.env.VITE_FIREBASE_...
// If keys are missing, the app will gracefully degrade to "Guest Mode" (no saving).
// Casting to any to avoid "Property 'env' does not exist on type 'ImportMeta'" TS error
const env = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "mock-key",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

let app, auth, db;
let isConfigured = false;

try {
  if (env.VITE_FIREBASE_API_KEY) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    isConfigured = true;
  } else {
    console.warn("Firebase Config missing. Auth and History features will be disabled.");
  }
} catch (e) {
  console.error("Firebase Initialization Error:", e);
}

export const AuthService = {
  signInWithGoogle: async () => {
    if (!isConfigured || !auth) throw new Error("Firebase not configured");
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  },
  signOut: async () => {
    if (!isConfigured || !auth) return;
    return firebaseSignOut(auth);
  },
  getAuthInstance: () => auth
};

export const HistoryService = {
  // Fixed signature: Omit 'date' as it is generated inside the function
  saveSimulation: async (userId: string, data: Omit<SavedSimulation, 'id' | 'userId' | 'date'>) => {
    if (!isConfigured || !db) return;
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
    if (!isConfigured || !db) return [];
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