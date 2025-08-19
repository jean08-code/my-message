
// src/lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase project configuration
const firebaseConfig: FirebaseOptions = {
  projectId: "ripplechat-mtir3",
  appId: "1:497978174070:web:fe08b0705833a0f86c0d57",
  storageBucket: "ripplechat-mtir3.firebasestorage.app",
  apiKey: "AIzaSyB8Va1PueHY5cDdq37Qb4hfsAHrerBtz4E",
  authDomain: "ripplechat-mtir3.firebaseapp.com",
  messagingSenderId: "497978174070"
};

// A function to check if the config is still using placeholder values
export const isFirebaseConfigured = firebaseConfig && firebaseConfig.apiKey !== "YOUR_API_KEY";

// Initialize Firebase
let app;
if (isFirebaseConfigured) {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
}


const auth = isFirebaseConfigured ? getAuth(app!) : null;
const db = isFirebaseConfigured ? getFirestore(app!) : null;

export { app, auth, db };
