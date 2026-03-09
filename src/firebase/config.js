// src/firebase/config.js
// ============================================================
// FIREBASE CONFIGURATION
// 1. Go to https://console.firebase.google.com
// 2. Create a new project (or use existing)
// 3. Add a Web app → copy the firebaseConfig object below
// 4. Enable Firestore Database (Build → Firestore Database → Create database)
// 5. Enable Authentication (Build → Authentication → Get started → Email/Password)
// 6. Set Firestore Rules (for development use test mode, for production use rules below)
// ============================================================

import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

// 🔥 REPLACE WITH YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyBhpsU_oYNveY0N1B2aEZ1qTFEzqs7DDFY",
  authDomain: "codenest-dev.firebaseapp.com",
  projectId: "codenest-dev",
  storageBucket: "codenest-dev.firebasestorage.app",
  messagingSenderId: "974073871269",
  appId: "1:974073871269:web:5d5d4717e5f3666b2cc64c",
  measurementId: "G-KBN8LS83LM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize services
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)

export default app

/*
=== FIRESTORE SECURITY RULES ===
Paste these in Firebase Console → Firestore → Rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Inquiries — anyone can create, only admin reads
    match /inquiries/{id} {
      allow create: if true;
      allow read, update, delete: if request.auth != null && request.auth.token.admin == true;
    }

    // Comments — anyone can read/create
    match /comments/{id} {
      allow read, create: if true;
      allow delete: if request.auth != null && request.auth.token.admin == true;
    }

    // Projects — admin writes, assigned client reads
    match /projects/{id} {
      allow write: if request.auth != null && request.auth.token.admin == true;
      allow read: if request.auth != null &&
        (request.auth.token.admin == true ||
         resource.data.clientEmail == request.auth.token.email);
    }

    // Users — authenticated users read own data, admin reads all
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
*/
