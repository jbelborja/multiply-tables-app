import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration for english-verbs-app
const firebaseConfig = {
    apiKey: "AIzaSyCaocBqME-_8qRys1L8S2tUuhdUKLM9iGY",
    authDomain: "english-verbs-app.firebaseapp.com",
    projectId: "english-verbs-app",
    storageBucket: "english-verbs-app.firebasestorage.app",
    messagingSenderId: "364645965860",
    appId: "1:364645965860:web:c675335423acb4b64f78b1"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
