// IMPORTANT: In a real-world application, these values should be sourced from
// environment variables (e.g., .env.local) and not hardcoded.
// For this scaffold, placeholders are used. You must replace them with your
// actual Firebase project configuration.

export const FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "your-auth-domain",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "your-storage-bucket",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "your-messaging-sender-id",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "your-app-id",
};

// IMPORTANT: The default key is for development and demonstration only.
// In a production environment, you MUST set NEXT_PUBLIC_ENCRYPTION_KEY
// in your environment variables to a strong, unique secret.
export const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'stealthspeak-!@#-is-super-secret';

// The number of times the logo must be clicked to unlock the chat interface.
export const LOGO_CLICK_UNLOCK_COUNT = 3; // Changed to 3

// The collection name in Firestore where messages will be stored.
export const FIRESTORE_COLLECTION = 'messages';

// Secret room configuration
export const SECRET_ROOM_PASSWORD = 'ghost';
export const SECRET_ROOM_ID = 'secret_ghost_room_2024';
