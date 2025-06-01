
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
import { auth, db } from '@/lib/firebase'; // Firebase app instance
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Optionally, fetch additional user profile data from Firestore if you store it separately
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          // Merge Firebase Auth data with Firestore data if needed
          const firestoreUserData = userDocSnap.data();
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firestoreUserData.displayName || firebaseUser.displayName,
            photoURL: firestoreUserData.photoURL || firebaseUser.photoURL,
          });
        } else {
          // If no separate profile, just use auth data
          setUser(mapFirebaseUserToAppUser(firebaseUser));
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged will handle setting the user state
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
      if (error instanceof Error) {
        throw new Error(error.message || "Failed to login. Please check your credentials.");
      }
      throw new Error("Failed to login. Please check your credentials.");
    }
    // setLoading(false) will be handled by onAuthStateChanged effect
  };

  const logout = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      // onAuthStateChanged will handle setting user to null
    } catch (error) {
      console.error("Logout error: ", error);
      // Still set user to null and loading to false in case of error
      setUser(null); 
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, pass: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      
      // Update Firebase Auth profile
      await updateProfile(firebaseUser, { displayName: name });

      // Create a user document in Firestore (optional, but good for storing additional profile info)
      const userDocRef = doc(db, "users", firebaseUser.uid);
      await setDoc(userDocRef, {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: name,
        photoURL: firebaseUser.photoURL || `https://placehold.co/100x100.png?text=${name.substring(0,1)}`, // Default placeholder
        createdAt: new Date().toISOString(),
      });

      // onAuthStateChanged will handle setting the user state with the new profile
    } catch (error) {
      console.error("Signup error:", error);
      setLoading(false);
      if (error instanceof Error) {
        throw new Error(error.message || "Failed to sign up.");
      }
      throw new Error("Failed to sign up.");
    }
    // setLoading(false) will be handled by onAuthStateChanged effect
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
