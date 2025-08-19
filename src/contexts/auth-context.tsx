
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
import type { User as AppUser } from '@/lib/types'; // Your app's User type
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: AppUser | null; // Use your AppUser type
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to map FirebaseUser to AppUser
const mapFirebaseUserToAppUser = (firebaseUser: FirebaseUser | null): AppUser | null => {
  if (!firebaseUser) return null;
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
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
            setUser(JSON.parse(mockUserJson));
        }
        setLoading(false);
        return;
    }

    // Proactive check for placeholder API key
    if (firebaseApp && firebaseApp.options && firebaseApp.options.apiKey === "YOUR_API_KEY") {
      console.error(
        "***********************************************************************************\n" +
        "CRITICAL FIREBASE CONFIGURATION ERROR:\n" +
        "The API key in src/lib/firebase.ts is still the default placeholder 'YOUR_API_KEY'.\n" +
        "You MUST replace this with your actual Firebase project's API key for the app to work.\n" +
        "Go to your Firebase project console -> Project settings -> General -> Your apps -> Web app SDK snippet.\n" +
        "***********************************************************************************"
      );
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const firestoreUserData = userDocSnap.data();
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firestoreUserData.displayName || firebaseUser.displayName,
            photoURL: firestoreUserData.photoURL || firebaseUser.photoURL,
          });
        } else {
          setUser(mapFirebaseUserToAppUser(firebaseUser));
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe(); 
  }, []);

  const login = async (email: string, pass: string) => {
    if (!isFirebaseConfigured) {
        // Mock login
        setLoading(true);
        // In a real mock, you'd check against a mock user store. Here we just create a user.
        const mockUser = {
            uid: `mock_${email}`,
            email: email,
            displayName: email.split('@')[0],
            photoURL: `https://placehold.co/100x100.png?text=${email.substring(0,1).toUpperCase()}`,
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
    if (!isFirebaseConfigured) {
        // Mock logout
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
        // Mock signup
        setLoading(true);
        const mockUser = {
            uid: `mock_${email}`,
            email: email,
            displayName: name,
            photoURL: `https://placehold.co/100x100.png?text=${name.substring(0,1).toUpperCase()}`,
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
        createdAt: new Date().toISOString(),
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
