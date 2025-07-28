import { 
  collection, 
  query, 
  where, 
  getDocs, 
  writeBatch, 
  addDoc, 
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { encryptMessage } from '@/lib/encryption';

const FIRESTORE_COLLECTION = 'messages';

interface CleanupOptions {
  roomId: string;
  sessionId: string;
  deleteAll?: boolean;
  onlyViewedMessages?: boolean;
}

/**
 * Auto-cleanup function that handles different cleanup scenarios
 */
export async function cleanupMessages({
  roomId,
  sessionId,
  deleteAll = false,
  onlyViewedMessages = false
}: CleanupOptions): Promise<number> {
  try {
    const batch = writeBatch(db);
    let deleteCount = 0;
    let hasUpdates = false;

    const q = query(
      collection(db, FIRESTORE_COLLECTION),
      where('roomId', '==', roomId),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      if (deleteAll) {
        batch.delete(doc.ref);
        hasUpdates = true;
        deleteCount++;
      } else if (onlyViewedMessages) {
        if (data.type === 'message' && data.viewedBy && data.viewedBy.length > 1) {
          batch.delete(doc.ref);
          hasUpdates = true;
          deleteCount++;
        }
      } else {
        if (data.type === 'message' && data.viewedBy && data.viewedBy.includes(sessionId)) {
          batch.delete(doc.ref);
          hasUpdates = true;
          deleteCount++;
        }
      }
    });

    if (hasUpdates) {
      await batch.commit();
      console.log(`🧹 Cleaned up ${deleteCount} messages from room ${roomId}`);
    }

    return deleteCount;
  } catch (error) {
    console.error('Error cleaning up messages:', error);
    throw error;
  }
}

/**
 * Add a system message to indicate user activity
 */
export async function addSystemMessage(roomId: string, sessionId: string, message: string): Promise<void> {
  try {
    const encryptedText = encryptMessage(message);
    await addDoc(collection(db, FIRESTORE_COLLECTION), {
      encryptedText,
      sessionId,
      roomId,
      type: 'system',
      timestamp: serverTimestamp(),
      sentAt: serverTimestamp(),
      viewedBy: [],
    });
  } catch (error) {
    console.error('Error adding system message:', error);
    throw error;
  }
}

/**
 * Checks if a room exists and has active users
 */
export async function checkRoomActivity(roomId: string): Promise<{ hasMessages: boolean; userCount: number; isSecretRoom: boolean }> {
  try {
    const q = query(
      collection(db, FIRESTORE_COLLECTION),
      where('roomId', '==', roomId),
      limit(10)
    );
    
    const querySnapshot = await getDocs(q);
    const uniqueUsers = new Set<string>();
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.sessionId) {
        uniqueUsers.add(data.sessionId);
      }
    });

    return {
      hasMessages: !querySnapshot.empty,
      userCount: uniqueUsers.size,
      isSecretRoom: roomId === 'secret_ghost_room_2024'
    };
  } catch (error) {
    console.error('Error checking room activity:', error);
    return { hasMessages: false, userCount: 0, isSecretRoom: false };
  }
}

/**
 * Enhanced message persistence that respects view-once behavior
 */
export function shouldPersistMessage(
  messageViewedBy: string[],
  totalUsersInRoom: number,
  isViewOnceMode: boolean = true,
  isGhostRoom: boolean = false
): boolean {
  if (isGhostRoom) {
    return messageViewedBy.length < 2;
  }
  
  if (!isViewOnceMode) {
    return true;
  }
  
  return messageViewedBy.length < totalUsersInRoom;
}

/**
 * Real-time sync optimization
 */
export function optimizeRealTimeSync(): {
  enabledFeatures: string[];
  syncInterval: number;
} {
  return {
    enabledFeatures: [
      'instant-delivery',
      'typing-indicators',
      'read-receipts',
      'message-status',
      'auto-cleanup',
      'ghost-mode'
    ],
    syncInterval: 100
  };
}
