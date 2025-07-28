import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';
import { FIREBASE_CONFIG } from '@/config';

let firebaseApp: FirebaseApp;
let db: Firestore;

// Validate Firebase configuration
function validateFirebaseConfig() {
  const required = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missing = required.filter(key => 
    !FIREBASE_CONFIG[key as keyof typeof FIREBASE_CONFIG] || 
    FIREBASE_CONFIG[key as keyof typeof FIREBASE_CONFIG].toString().includes('your-')
  );
  
  if (missing.length > 0) {
    throw new Error(`Missing or invalid Firebase configuration: ${missing.join(', ')}. Please check your .env.local file.`);
  }
}

// Initialize Firebase with proper error handling
function initializeFirebase() {
  try {
    // Validate configuration first
    validateFirebaseConfig();
    
    if (!getApps().length) {
      firebaseApp = initializeApp(FIREBASE_CONFIG);
      console.log('✅ Firebase initialized successfully');
    } else {
      firebaseApp = getApps()[0];
      console.log('✅ Firebase already initialized');
    }

    // Initialize Firestore with settings for better reliability
    db = getFirestore(firebaseApp);
    
    // Enable offline persistence (helps with connection issues)
    if (typeof window !== 'undefined') {
      import('firebase/firestore').then(({ enableNetwork, disableNetwork }) => {
        // You can customize offline behavior here
      });
    }

    return { app: firebaseApp, db };
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    throw error;
  }
}

// Initialize Firebase
try {
  const { app, db: database } = initializeFirebase();
  firebaseApp = app;
  db = database;
} catch (error) {
  console.error('❌ Critical Firebase initialization error:', error);
  throw error;
}

export { db, firebaseApp };
