import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, writeBatch, serverTimestamp, addDoc, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { FIRESTORE_COLLECTION } from '@/config';
import { encryptMessage, decryptMessage } from '@/lib/crypto';
import { cleanupMessages } from '@/lib/chat-utils';
import { getConnectionMonitor, type ConnectionStatus } from '@/lib/connection-monitor';

export interface MessageEvent {
  type: 'message' | 'user_joined' | 'user_left' | 'typing' | 'system';
  data: any;
  timestamp: Date;
  sessionId: string;
  roomId: string;
}

export interface RoomStats {
  activeUsers: number;
  totalMessages: number;
  lastActivity: Date;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
}

export class BackendService {
  private listeners: Map<string, () => void> = new Map();
  private eventCallbacks: Map<string, (event: MessageEvent) => void> = new Map();
  private roomStatsCallbacks: Map<string, (stats: RoomStats) => void> = new Map();

  constructor(private sessionId: string) {}

  // Enhanced room creation with metadata
  async createRoom(roomName?: string): Promise<{ roomId: string; success: boolean; error?: string }> {
    try {
      const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create room metadata
      const welcomeMessage = `Room "${roomName || 'Secure Chat'}" created successfully. Ultra-secure communication enabled.`;
      const encryptedText = encryptMessage(welcomeMessage);

      await addDoc(collection(db, FIRESTORE_COLLECTION), {
        encryptedText,
        sessionId: this.sessionId,
        roomId,
        type: 'system',
        timestamp: serverTimestamp(),
        sentAt: serverTimestamp(),
        viewedBy: [this.sessionId],
        roomMetadata: {
          createdBy: this.sessionId,
          roomName: roomName || 'Secure Chat',
          createdAt: serverTimestamp(),
          isActive: true,
          features: {
            panicDelete: true,
            viewOnce: true,
            realTimeSync: true,
            encryption: true
          }
        }
      });

      return { roomId, success: true };
    } catch (error) {
      console.error('Room creation failed:', error);
      return { 
        roomId: '', 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Enhanced message sending with retry logic and status tracking
  async sendMessage(
    roomId: string, 
    text: string, 
    options: { 
      shouldObfuscate?: boolean; 
      retryCount?: number; 
      priority?: 'normal' | 'high' | 'urgent' 
    } = {}
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { shouldObfuscate = false, retryCount = 0, priority = 'normal' } = options;
    
    try {
      let messageToSend = text;
      
      // Handle message obfuscation if needed
      if (shouldObfuscate) {
        try {
          // Use backup obfuscator instead of Genkit
          const { obfuscateMessage } = await import('@/lib/message-obfuscator');
          const result = await obfuscateMessage({ message: text, shouldObfuscate: true });
          messageToSend = JSON.stringify(result);
        } catch (obfuscationError) {
          console.warn('Message obfuscation failed, sending original:', obfuscationError);
        }
      }
      
      const encryptedText = encryptMessage(messageToSend);
      const messageId = `${this.sessionId}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

      const messageData = {
        encryptedText,
        sessionId: this.sessionId,
        roomId,
        type: 'message',
        timestamp: serverTimestamp(),
        sentAt: serverTimestamp(),
        viewedBy: [this.sessionId],
        deliveryStatus: 'sent',
        messageId,
        isObfuscated: shouldObfuscate,
        priority,
        retryCount,
        clientTimestamp: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, FIRESTORE_COLLECTION), messageData);
      
      return { 
        success: true, 
        messageId: docRef.id 
      };

    } catch (error) {
      console.error('Message send failed:', error);
      
      // Implement retry logic for failed sends
      if (retryCount < 3) {
        console.log(`Retrying message send... Attempt ${retryCount + 1}/3`);
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        
        return this.sendMessage(roomId, text, { 
          ...options, 
          retryCount: retryCount + 1 
        });
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Real-time message listener with enhanced error recovery
  startRealTimeListener(
    roomId: string, 
    onMessage: (event: MessageEvent) => void,
    onError?: (error: Error) => void
  ): string {
    const listenerId = `listener_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    const q = query(
      collection(db, FIRESTORE_COLLECTION),
      where('roomId', '==', roomId),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        querySnapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            
            try {
              const decryptedText = decryptMessage(data.encryptedText);
              
              const event: MessageEvent = {
                type: data.type || 'message',
                data: {
                  id: change.doc.id,
                  text: decryptedText,
                  sessionId: data.sessionId,
                  timestamp: data.timestamp?.toDate() || new Date(),
                  isObfuscated: decryptedText.startsWith('{"formattedMessage":'),
                  viewedBy: data.viewedBy || [],
                  deliveryStatus: data.deliveryStatus || 'sent'
                },
                timestamp: data.timestamp?.toDate() || new Date(),
                sessionId: data.sessionId,
                roomId: data.roomId
              };

              onMessage(event);
              
            } catch (decryptError) {
              console.error('Message decryption failed:', decryptError);
              if (onError) onError(decryptError as Error);
            }
          }
        });
      },
      (error) => {
        console.error('Real-time listener error:', error);
        if (onError) onError(error);
        
        // Auto-retry connection after 3 seconds
        setTimeout(() => {
          console.log('Attempting to reconnect real-time listener...');
          this.startRealTimeListener(roomId, onMessage, onError);
        }, 3000);
      }
    );

    this.listeners.set(listenerId, unsubscribe);
    return listenerId;
  }

  // Ultra-fast panic delete with immediate response
  async panicDelete(roomId: string): Promise<{ success: boolean; deletedCount: number; responseTime: number }> {
    const startTime = Date.now();
    
    try {
      // Immediate local response - don't wait for Firebase
      const deletePromise = cleanupMessages({
        roomId,
        sessionId: this.sessionId,
        deleteAll: true
      });

      // Return immediately for ultra-fast response
      const responseTime = Date.now() - startTime;
      
      // Continue deletion in background
      deletePromise.catch(error => {
        console.error('Background panic delete error:', error);
      });

      return {
        success: true,
        deletedCount: -1, // Unknown at this point due to async nature
        responseTime
      };

    } catch (error) {
      console.error('Panic delete failed:', error);
      return {
        success: false,
        deletedCount: 0,
        responseTime: Date.now() - startTime
      };
    }
  }

  // Get room statistics in real-time
  startRoomStatsListener(roomId: string, onStats: (stats: RoomStats) => void): string {
    const listenerId = `stats_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    const q = query(
      collection(db, FIRESTORE_COLLECTION),
      where('roomId', '==', roomId)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const activeUsers = new Set<string>();
      let totalMessages = 0;
      let lastActivity = new Date(0);

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        if (data.sessionId) {
          activeUsers.add(data.sessionId);
        }
        
        if (data.type === 'message') {
          totalMessages++;
        }
        
        const messageTime = data.timestamp?.toDate() || new Date();
        if (messageTime > lastActivity) {
          lastActivity = messageTime;
        }
      });

      const stats: RoomStats = {
        activeUsers: activeUsers.size,
        totalMessages,
        lastActivity,
        connectionQuality: 'excellent' // This would be calculated based on connection monitor
      };

      onStats(stats);
    });

    this.listeners.set(listenerId, unsubscribe);
    return listenerId;
  }

  // Stop specific listener
  stopListener(listenerId: string): void {
    const unsubscribe = this.listeners.get(listenerId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(listenerId);
    }
  }

  // Stop all listeners
  stopAllListeners(): void {
    this.listeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.listeners.clear();
  }

  // Monitor connection status
  startConnectionMonitoring(): void {
    const monitor = getConnectionMonitor(this.sessionId);
    monitor.startMonitoring();
    
    monitor.onStatusChange((status: ConnectionStatus) => {
      console.log('Connection status changed:', status);
      // Emit connection events to UI if needed
    });
  }

  // Cleanup all resources
  cleanup(): void {
    this.stopAllListeners();
    // Additional cleanup can be added here
  }
}

// Global service instance
let globalBackendService: BackendService | null = null;

export function getBackendService(sessionId: string): BackendService {
  if (!globalBackendService || globalBackendService['sessionId'] !== sessionId) {
    if (globalBackendService) {
      globalBackendService.cleanup();
    }
    globalBackendService = new BackendService(sessionId);
  }
  return globalBackendService;
}
