"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { collection, addDoc, query, where, onSnapshot, orderBy, limit, serverTimestamp, doc, updateDoc, arrayUnion, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { encryptMessage, decryptMessage } from '@/lib/encryption';
import { cleanupMessages } from '@/lib/chat-utils';

const FIRESTORE_COLLECTION = 'messages';
const AUTO_DELETE_DELAY = 5 * 60 * 1000; // 5 minutes

interface MessageReaction {
  emoji: string;
  userId: string;
  timestamp: Date;
}

export interface Message {
  id: string;
  text: string;
  sessionId: string;
  timestamp: Date;
  roomId: string;
  type: 'message' | 'system' | 'voice';
  viewedBy: string[];
  sentAt: Date;
  delivered: boolean;
  viewed: boolean;
  deliveredAt?: Date;
  viewedAt?: Date;
  autoDeleteScheduled?: boolean;
  disappearTimer?: number;
  disappearAt?: Date;
  voiceData?: string;
  voiceDuration?: number;
  reactions?: MessageReaction[];
  playedBy?: string[];
  deletedBy?: string[];
  deletedForEveryone?: boolean;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [sessionId] = useState(() => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const newestMessageRef = useRef<Message | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const autoDeleteTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Schedule auto-deletion
  const scheduleAutoDelete = useCallback((messageId: string, roomId: string, customDelay?: number) => {
    if (autoDeleteTimeouts.current.has(messageId)) {
      clearTimeout(autoDeleteTimeouts.current.get(messageId)!);
    }

    const delay = customDelay || AUTO_DELETE_DELAY;
    const timeout = setTimeout(async () => {
      try {
        await deleteDoc(doc(db, FIRESTORE_COLLECTION, messageId));
        console.log(`🗑️ Auto-deleted message: ${messageId}`);
        autoDeleteTimeouts.current.delete(messageId);
      } catch (error) {
        console.warn('Auto-delete failed:', error);
      }
    }, delay);

    autoDeleteTimeouts.current.set(messageId, timeout);
  }, []);

  // Start real-time listener
  const startRealTimeListener = useCallback((currentRoomId: string) => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    const q = query(
      collection(db, FIRESTORE_COLLECTION),
      where('roomId', '==', currentRoomId),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const firebaseMessages: Message[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          
          // Skip messages deleted for everyone
          if (data.deletedForEveryone) return;
          
          // Skip messages deleted by current user
          if (data.deletedBy && data.deletedBy.includes(sessionId)) return;
          
          let decryptedText = data.encryptedText;
          try {
            decryptedText = decryptMessage(data.encryptedText);
          } catch (decryptError) {
            console.warn('Failed to decrypt message:', decryptError);
          }
          
          const viewedBy = data.viewedBy || [];
          const isViewed = viewedBy.length > 1;
          const isDelivered = data.delivered || viewedBy.length > 0;
          
          const message: Message = {
            id: doc.id,
            text: decryptedText,
            sessionId: data.sessionId,
            timestamp: data.timestamp?.toDate() || new Date(),
            roomId: data.roomId,
            type: data.type || 'message',
            viewedBy,
            sentAt: data.sentAt?.toDate() || new Date(),
            delivered: isDelivered,
            viewed: isViewed,
            deliveredAt: data.deliveredAt?.toDate(),
            viewedAt: data.viewedAt?.toDate(),
            autoDeleteScheduled: data.autoDeleteScheduled || false,
            disappearTimer: data.disappearTimer,
            disappearAt: data.disappearAt?.toDate(),
            voiceData: data.voiceData,
            voiceDuration: data.voiceDuration,
            reactions: data.reactions || [],
            playedBy: data.playedBy || [],
            deletedBy: data.deletedBy || [],
            deletedForEveryone: data.deletedForEveryone || false
          };

          firebaseMessages.push(message);
        });
        
        firebaseMessages.reverse();
        setMessages(firebaseMessages);
        setIsConnected(true);
        
        if (firebaseMessages.length > 0) {
          newestMessageRef.current = firebaseMessages[firebaseMessages.length - 1];
          
          // Mark messages as viewed and schedule auto-deletion
          firebaseMessages.forEach(async (message) => {
            if (message.sessionId !== sessionId && !message.viewedBy.includes(sessionId)) {
              try {
                await updateDoc(doc(db, FIRESTORE_COLLECTION, message.id), {
                  viewedBy: arrayUnion(sessionId),
                  delivered: true,
                  deliveredAt: serverTimestamp(),
                  viewedAt: serverTimestamp()
                });

                if (!message.autoDeleteScheduled) {
                  await updateDoc(doc(db, FIRESTORE_COLLECTION, message.id), {
                    autoDeleteScheduled: true
                  });
                  scheduleAutoDelete(message.id, message.roomId);
                }
              } catch (error) {
                console.warn('Failed to mark message as viewed:', error);
              }
            }

            // Schedule disappearing message deletion
            if (message.disappearAt && !message.autoDeleteScheduled) {
              const timeUntilDisappear = message.disappearAt.getTime() - Date.now();
              if (timeUntilDisappear > 0) {
                scheduleAutoDelete(message.id, message.roomId, timeUntilDisappear);
              }
            }
          });
        }
      },
      (error) => {
        console.error('Real-time listener error:', error);
        setError('Connection lost. Attempting to reconnect...');
        setIsConnected(false);
        
        setTimeout(() => {
          console.log('Attempting to reconnect...');
          startRealTimeListener(currentRoomId);
        }, 3000);
      }
    );

    unsubscribeRef.current = unsubscribe;
  }, [sessionId, scheduleAutoDelete]);

  // Set room
  const setRoom = useCallback((newRoomId: string) => {
    autoDeleteTimeouts.current.forEach(timeout => clearTimeout(timeout));
    autoDeleteTimeouts.current.clear();
    
    setRoomId(newRoomId);
    setMessages([]);
    setError(null);
    startRealTimeListener(newRoomId);
  }, [startRealTimeListener]);

  // Send text message
  const sendMessage = useCallback(async (text: string, disappearTimer?: number) => {
    if (!roomId || !sessionId) {
      setError('Missing room or session information');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const encryptedText = encryptMessage(text);
      const messageData: any = {
        roomId,
        sessionId,
        encryptedText,
        timestamp: serverTimestamp(),
        sentAt: serverTimestamp(),
        type: 'message',
        viewedBy: [sessionId],
        delivered: false,
        viewed: false,
        autoDeleteScheduled: false,
        reactions: [],
        deletedBy: [],
        deletedForEveryone: false
      };

      if (disappearTimer) {
        const disappearAt = new Date(Date.now() + disappearTimer * 1000);
        messageData.disappearTimer = disappearTimer;
        messageData.disappearAt = disappearAt;
      }

      const docRef = await addDoc(collection(db, FIRESTORE_COLLECTION), messageData);
      
      setTimeout(async () => {
        try {
          await updateDoc(docRef, {
            delivered: true,
            deliveredAt: serverTimestamp()
          });
        } catch (error) {
          console.warn('Failed to update delivery status:', error);
        }
      }, 100);

    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  }, [sessionId, roomId]);

  // Send voice message
  const sendVoiceMessage = useCallback(async (voiceData: string, duration: number, disappearTimer?: number) => {
    if (!roomId || !sessionId) {
      setError('Missing room or session information');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const encryptedText = encryptMessage(`Voice message (${duration}s)`);
      const messageData: any = {
        roomId,
        sessionId,
        encryptedText,
        timestamp: serverTimestamp(),
        sentAt: serverTimestamp(),
        type: 'voice',
        viewedBy: [sessionId],
        delivered: false,
        viewed: false,
        autoDeleteScheduled: false,
        voiceData,
        voiceDuration: duration,
        playedBy: [],
        reactions: [],
        deletedBy: [],
        deletedForEveryone: false
      };

      if (disappearTimer) {
        const disappearAt = new Date(Date.now() + disappearTimer * 1000);
        messageData.disappearTimer = disappearTimer;
        messageData.disappearAt = disappearAt;
      }

      const docRef = await addDoc(collection(db, FIRESTORE_COLLECTION), messageData);
      
      setTimeout(async () => {
        try {
          await updateDoc(docRef, {
            delivered: true,
            deliveredAt: serverTimestamp()
          });
        } catch (error) {
          console.warn('Failed to update delivery status:', error);
        }
      }, 100);

    } catch (error) {
      console.error('Failed to send voice message:', error);
      setError('Failed to send voice message. Please try again.');
    } finally {
      setIsSending(false);
    }
  }, [sessionId, roomId]);

  // Delete message for current user only
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const messageRef = doc(db, FIRESTORE_COLLECTION, messageId);
      await updateDoc(messageRef, {
        deletedBy: arrayUnion(sessionId)
      });
    } catch (error) {
      console.error('Failed to delete message:', error);
      throw error;
    }
  }, [sessionId]);

  // Delete multiple messages for current user
  const deleteMessages = useCallback(async (messageIds: string[]) => {
    try {
      const batch = writeBatch(db);
      
      messageIds.forEach((messageId) => {
        const messageRef = doc(db, FIRESTORE_COLLECTION, messageId);
        batch.update(messageRef, {
          deletedBy: arrayUnion(sessionId)
        });
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Failed to delete messages:', error);
      throw error;
    }
  }, [sessionId]);

  // Delete message for everyone (only own messages)
  const deleteMessageForEveryone = useCallback(async (messageId: string) => {
    try {
      const messageRef = doc(db, FIRESTORE_COLLECTION, messageId);
      await updateDoc(messageRef, {
        deletedForEveryone: true
      });
    } catch (error) {
      console.error('Failed to delete message for everyone:', error);
      throw error;
    }
  }, []);

  // Add reaction
  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    try {
      const messageRef = doc(db, FIRESTORE_COLLECTION, messageId);
      const reaction: MessageReaction = {
        emoji,
        userId: sessionId,
        timestamp: new Date()
      };

      await updateDoc(messageRef, {
        reactions: arrayUnion(reaction)
      });
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  }, [sessionId]);

  // Mark voice as played
  const markVoiceAsPlayed = useCallback(async (messageId: string) => {
    try {
      const messageRef = doc(db, FIRESTORE_COLLECTION, messageId);
      await updateDoc(messageRef, {
        playedBy: arrayUnion(sessionId)
      });
    } catch (error) {
      console.error('Failed to mark voice as played:', error);
    }
  }, [sessionId]);

  // Leave room
  const leaveRoom = useCallback(async () => {
    if (!roomId) return;

    try {
      autoDeleteTimeouts.current.forEach(timeout => clearTimeout(timeout));
      autoDeleteTimeouts.current.clear();

      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      setRoomId(null);
      setMessages([]);
      setIsConnected(false);
    } catch (error) {
      console.warn('Error during leave:', error);
    }
  }, [roomId]);

  // Logout
  const logout = useCallback(async () => {
    if (!roomId) return;

    try {
      autoDeleteTimeouts.current.forEach(timeout => clearTimeout(timeout));
      autoDeleteTimeouts.current.clear();

      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      setRoomId(null);
      setMessages([]);
      setIsConnected(false);
    } catch (error) {
      console.warn('Cleanup failed during logout:', error);
    }
  }, [roomId]);

  // Panic delete
  const panicDelete = useCallback(async (targetRoomId?: string) => {
    const roomToDelete = targetRoomId || roomId;
    if (!roomToDelete) return;

    try {
      autoDeleteTimeouts.current.forEach(timeout => clearTimeout(timeout));
      autoDeleteTimeouts.current.clear();

      await cleanupMessages({
        roomId: roomToDelete,
        sessionId,
        deleteAll: true,
        onlyViewedMessages: false
      });
      
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      
      setRoomId(null);
      setMessages([]);
      setIsConnected(false);
    } catch (error) {
      console.error('Panic delete failed:', error);
      setRoomId(null);
      setMessages([]);
      setIsConnected(false);
    }
  }, [sessionId, roomId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      autoDeleteTimeouts.current.forEach(timeout => clearTimeout(timeout));
      autoDeleteTimeouts.current.clear();
      
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  return {
    messages,
    sendMessage,
    sendVoiceMessage,
    addReaction,
    markVoiceAsPlayed,
    deleteMessage,
    deleteMessages,
    deleteMessageForEveryone,
    isSending,
    error,
    sessionId,
    newestMessage: newestMessageRef.current,
    roomId,
    setRoomId: setRoom,
    leaveRoom,
    logout,
    panicDelete,
    isConnected
  };
}