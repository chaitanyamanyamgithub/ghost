import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  type Firestore,
  enableNetwork,
  disableNetwork,
  connectFirestoreEmulator 
} from 'firebase/firestore';
import { FIREBASE_CONFIG } from '@/config';

// Connection state management
let firebaseApp: FirebaseApp;
let db: Firestore;
let isConnected = true;
let connectionRetries = 0;
const MAX_RETRIES = 3;

// Validate Firebase configuration
function validateFirebaseConfig() {
  const required = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missing = required.filter(key => 
    !FIREBASE_CONFIG[key as keyof typeof FIREBASE_CONFIG] || 
    FIREBASE_CONFIG[key as keyof typeof FIREBASE_CONFIG].toString().includes('your-')
  );
  
  if (missing.length > 0) {
    console.error('❌ Firebase configuration error:', missing);
    throw new Error(
      `🔥 FIREBASE SETUP REQUIRED!\n\n` +
      `Missing configuration: ${missing.join(', ')}\n\n` +
      `1. Check your .env.local file\n` +
      `2. Get values from Firebase Console\n` +
      `3. See FIREBASE_SETUP_GUIDE.md for details\n\n` +
      `Current project ID: ${FIREBASE_CONFIG.projectId}`
    );
  }
}

// Enhanced Firebase initialization with retry logic
async function initializeFirebaseWithRetry(): Promise<{ app: FirebaseApp; db: Firestore }> {
  try {
    validateFirebaseConfig();
    
    if (!getApps().length) {
      firebaseApp = initializeApp(FIREBASE_CONFIG);
      console.log('✅ Firebase app initialized');
    } else {
      firebaseApp = getApps()[0];
      console.log('✅ Firebase app already exists');
    }

    // Initialize Firestore with enhanced settings
    db = getFirestore(firebaseApp);
    
    // Test connection
    await testConnection();
    
    console.log('🎉 Firebase ready for real-time chat!');
    return { app: firebaseApp, db };

  } catch (error) {
    connectionRetries++;
    console.error(`❌ Firebase init attempt ${connectionRetries}/${MAX_RETRIES} failed:`, error);
    
    if (connectionRetries < MAX_RETRIES) {
      console.log(`🔄 Retrying in ${connectionRetries * 2} seconds...`);
      await new Promise(resolve => setTimeout(resolve, connectionRetries * 2000));
      return initializeFirebaseWithRetry();
    }
    
    throw new Error(
      `🚨 Firebase initialization failed after ${MAX_RETRIES} attempts!\n\n` +
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}\n\n` +
      `Quick fixes:\n` +
      `1. Check your internet connection\n` +
      `2. Verify Firebase project exists: ${FIREBASE_CONFIG.projectId}\n` +
      `3. Update .env.local with correct values\n` +
      `4. Visit: https://console.firebase.google.com/project/${FIREBASE_CONFIG.projectId}\n\n` +
      `See FIREBASE_SETUP_GUIDE.md for complete setup instructions.`
    );
  }
}

// Test Firebase connection
async function testConnection(): Promise<void> {
  try {
    // This will trigger a connection attempt
    const testDoc = await import('firebase/firestore').then(({ doc, getDoc }) => 
      getDoc(doc(db, '_test_connection', 'test'))
    );
    console.log('🔗 Firebase connection test passed');
  } catch (error) {
    console.warn('⚠️ Firebase connection test failed, but continuing:', error);
    // Don't throw here - the connection might work for other operations
  }
}

// Connection monitoring for real-time features
export function monitorConnection() {
  if (typeof window === 'undefined') return;

  // Listen for online/offline events
  window.addEventListener('online', async () => {
    console.log('🌐 Network back online, reconnecting to Firebase...');
    try {
      await enableNetwork(db);
      isConnected = true;
      console.log('✅ Firebase reconnected');
    } catch (error) {
      console.error('❌ Failed to reconnect to Firebase:', error);
    }
  });

  window.addEventListener('offline', async () => {
    console.log('📱 Network offline, Firebase will use cache');
    isConnected = false;
  });
}

// Get connection status
export function getConnectionStatus() {
  return {
    isConnected,
    isOnline: typeof window !== 'undefined' ? window.navigator.onLine : true,
    projectId: FIREBASE_CONFIG.projectId
  };
}

// Enhanced error handling for real-time operations
export function handleFirebaseError(error: any) {
  const errorCode = error?.code || 'unknown';
  const errorMessage = error?.message || 'Unknown Firebase error';
  
  console.error(`🔥 Firebase Error [${errorCode}]:`, errorMessage);
  
  // Common error solutions
  const solutions: { [key: string]: string[] } = {
    'permission-denied': [
      'Check Firestore security rules',
      'Ensure database exists',
      'Verify user permissions'
    ],
    'unavailable': [
      'Check internet connection',
      'Firebase servers may be down',
      'Try again in a few moments'
    ],
    'unauthenticated': [
      'Check Firebase configuration',
      'Verify API key is correct',
      'Ensure project ID matches'
    ],
    'failed-precondition': [
      'Database may not be created',
      'Check project exists in Firebase Console',
      'Verify Firestore is enabled'
    ]
  };
  
  if (solutions[errorCode]) {
    console.log(`💡 Suggested solutions for ${errorCode}:`, solutions[errorCode]);
  }
  
  return {
    code: errorCode,
    message: errorMessage,
    solutions: solutions[errorCode] || ['Check Firebase configuration and try again']
  };
}

// Initialize Firebase
let initPromise: Promise<{ app: FirebaseApp; db: Firestore }> | null = null;

if (!initPromise) {
  initPromise = initializeFirebaseWithRetry();
}

// Export the promise and resolved values
export const getFirebase = () => initPromise!;

// For immediate use (may throw if not initialized)
try {
  const init = await initPromise;
  firebaseApp = init.app;
  db = init.db;
  
  // Start connection monitoring for real-time features
  if (typeof window !== 'undefined') {
    monitorConnection();
  }
} catch (error) {
  console.error('🚨 Critical Firebase initialization error:', error);
}

export { db, firebaseApp };
