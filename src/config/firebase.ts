import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration for english-verbs-app
const firebaseConfig = {
  apiKey: "AIzaSyD7su_RoIbAjYZYRR2esR4_DT_7SlgLHdw",
  authDomain: "multitable-hero.firebaseapp.com",
  projectId: "multitable-hero",
  storageBucket: "multitable-hero.firebasestorage.app",
  messagingSenderId: "215785578868",
  appId: "1:215785578868:web:39a3d7d286f2750d5d0c21"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
