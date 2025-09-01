
"use client";

import type { User as FirebaseUser } from 'firebase/auth'; // Firebase's User type
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db, app as firebaseApp, isFirebaseConfigured } from '@/lib/firebase'; // Firebase app instance, import app
import type { User as AppUser, UserStatus } from '@/lib/types'; // Your app's User type
import { doc, setDoc, getDoc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getDatabase, ref, onValue, onDisconnect, set } from "firebase/database";

interface AuthContextType {
  user: AppUser | null; // Use your AppUser type
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to map FirebaseUser to AppUser
const mapFirebaseUserToAppUser = (firebaseUser: FirebaseUser | null, status?: UserStatus): AppUser | null => {
  if (!firebaseUser) return null;
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    status: status || 'offline',
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
        console.warn("Firebase is not configured. Running in mock mode.");
        const mockUserJson = localStorage.getItem('mockUser');
        if (mockUserJson) {
            const parsed = JSON.parse(mockUserJson)
            setUser({...parsed, status: 'online'});
        }
        setLoading(false);
        return;
    }

    if (firebaseApp && firebaseApp.options && firebaseApp.options.apiKey === "YOUR_API_KEY") {
      console.error(
        "CRITICAL FIREBASE CONFIGURATION ERROR: The API key is a placeholder."
      );
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Set up Realtime Database presence
        const rtdb = getDatabase(firebaseApp);
        const presenceRef = ref(rtdb, `.info/connected`);
        const userStatusRef = ref(rtdb, `status/${firebaseUser.uid}`);
        
        onValue(presenceRef, (snap) => {
          if (snap.val() === true) {
            set(userStatusRef, 'online');
            onDisconnect(userStatusRef).set('offline');
          }
        });

        // Get user data from Firestore
        const userDocRef = doc(db, "users", firebaseUser.uid);
        onSnapshot(userDocRef, (userDocSnap) => {
          if (userDocSnap.exists()) {
            const firestoreUserData = userDocSnap.data();
             setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firestoreUserData.displayName || firebaseUser.displayName,
                photoURL: firestoreUserData.photoURL || firebaseUser.photoURL,
                status: firestoreUserData.status || 'offline',
            });
          } else {
             setUser(mapFirebaseUserToAppUser(firebaseUser));
          }
        });
        
        // Also listen for RTDB status changes and update Firestore
        onValue(userStatusRef, (snap) => {
            const status = snap.val();
             if (status) {
                updateDoc(userDocRef, { status: status, lastChanged: serverTimestamp() });
             }
        });

      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe(); 
  }, []);

  const login = async (email: string, pass: string) => {
    if (!isFirebaseConfigured) {
        setLoading(true);
        const mockUser: AppUser = {
            uid: `mock_${email}`,
            email: email,
            displayName: email.split('@')[0],
            photoURL: `https://placehold.co/100x100.png?text=${email.substring(0,1).toUpperCase()}`,
            status: 'online',
        };
        localStorage.setItem('mockUser', JSON.stringify(mockUser));
        setUser(mockUser);
        setLoading(false);
        return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
      throw error; 
    }
  };

  const logout = async () => {
    if (user && isFirebaseConfigured) {
        // Set offline in RTDB before signing out
        const rtdb = getDatabase(firebaseApp);
        const userStatusRef = ref(rtdb, `status/${user.uid}`);
        await set(userStatusRef, 'offline');
    }
    if (!isFirebaseConfigured) {
        setLoading(true);
        localStorage.removeItem('mockUser');
        setUser(null);
        setLoading(false);
        return;
    }
    setLoading(true);
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Logout error: ", error);
    } finally {
      setUser(null); 
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, pass: string) => {
     if (!isFirebaseConfigured) {
        setLoading(true);
        const mockUser: AppUser = {
            uid: `mock_${email}`,
            email: email,
            displayName: name,
            photoURL: `https://placehold.co/100x100.png?text=${name.substring(0,1).toUpperCase()}`,
            status: 'online',
        };
        localStorage.setItem('mockUser', JSON.stringify(mockUser));
        setUser(mockUser);
        setLoading(false);
        return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      
      await updateProfile(firebaseUser, { displayName: name });

      const userDocRef = doc(db, "users", firebaseUser.uid);
      await setDoc(userDocRef, {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: name,
        photoURL: firebaseUser.photoURL || `https://placehold.co/100x100.png?text=${name.substring(0,1)}`,
        createdAt: serverTimestamp(),
        status: 'offline',
      });
    } catch (error) {
      console.error("Signup error:", error);
      setLoading(false);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
