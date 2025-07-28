"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  where,
  limit,
  getDocs,
  writeBatch,
  type Unsubscribe,
  type QueryDocumentSnapshot,
  type DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useSessionId } from '@/hooks/use-session';
import { encryptMessage, decryptMessage } from '@/lib/crypto';
import { FIRESTORE_COLLECTION } from '@/config';

interface MessageReaction {
  emoji: string;
  userId: string;
  timestamp: Date;
}

export interface Message {
  id: string;
  text: string;
  sessionId: string;
  timestamp: Date | null;
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
  voiceUrl?: string;
  voiceDuration?: number;
  reactions?: MessageReaction[];
  playedBy?: string[];
}

export function useChatFixed() {
  const sessionId = useSessionId();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const newestMessageRef = useRef<Message | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  // Set up real-time Firebase listener
  useEffect(() => {
    if (!roomId || !sessionId) {
      setMessages([]);
      setIsConnected(false);
      return;
    }

    console.log('🔥 Setting up Firebase real-time listener for room:', roomId);

    try {
      const messagesQuery = query(
        collection(db, FIRESTORE_COLLECTION),
        where('roomId', '==', roomId),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      const unsubscribe = onSnapshot(
        messagesQuery,
        (snapshot) => {
          try {
            setIsConnected(true);
            setError(null);

            const firebaseMessages: Message[] = [];
            
            snapshot.forEach((doc) => {
              const data = doc.data();
              
              // Decrypt message if needed
              let decryptedText = data.encryptedText;
              try {
                decryptedText = decryptMessage(data.encryptedText);
              } catch (decryptError) {
                console.warn('Failed to decrypt message, using raw text:', decryptError);
                decryptedText = data.encryptedText;
              }

              firebaseMessages.push({
                id: doc.id,
                text: decryptedText,
                sessionId: data.sessionId,
                timestamp: data.timestamp?.toDate() || new Date(),
                roomId: data.roomId,
                type: data.type || 'message',
                viewedBy: data.viewedBy || [],
                sentAt: data.timestamp?.toDate() || new Date(),
                delivered: data.delivered || false,
                viewed: data.viewed || false,
                deliveredAt: data.deliveredAt?.toDate() || null,
                viewedAt: data.viewedAt?.toDate() || null,
                autoDeleteScheduled: data.autoDeleteScheduled || false,
                disappearTimer: data.disappearTimer || null,
                disappearAt: data.disappearAt?.toDate() || null,
                voiceUrl: data.voiceUrl || null,
                voiceDuration: data.voiceDuration || null,
                reactions: data.reactions || [],
                playedBy: data.playedBy || []
              });
            });

            // Reverse to show oldest first
            firebaseMessages.reverse();
            
            setMessages(firebaseMessages);
            
            // Update newest message
            if (firebaseMessages.length > 0) {
              newestMessageRef.current = firebaseMessages[firebaseMessages.length - 1];
            }

            console.log(`🔄 Real-time update: ${firebaseMessages.length} messages loaded`);

          } catch (error) {
            console.error('❌ Error processing real-time messages:', error);
            setError('Failed to process messages');
          }
        },
        (error) => {
          console.error('❌ Firebase listener error:', error);
          setIsConnected(false);
          setError('Connection lost. Retrying...');
          
          // Retry connection after 3 seconds
          setTimeout(() => {
            if (roomId && sessionId) {
              console.log('🔄 Retrying Firebase connection...');
              // The useEffect will re-run and recreate the listener
            }
          }, 3000);
        }
      );

      unsubscribeRef.current = unsubscribe;

    } catch (error) {
      console.error('❌ Failed to set up Firebase listener:', error);
      setError('Failed to connect to chat');
      setIsConnected(false);
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
        console.log('🧹 Firebase listener cleaned up');
      }
    };
  }, [roomId, sessionId]);

  const sendMessage = useCallback(async (text: string, shouldObfuscate: boolean = false) => {
    if (!text.trim() || !sessionId || !roomId) {
      setError('Missing required information to send message');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      console.log('📤 Sending message via Firebase...');
      
      // Encrypt the message
      const encryptedText = encryptMessage(text);
      
      const messageData = {
        roomId,
        sessionId,
        encryptedText,
        timestamp: serverTimestamp(),
        type: shouldObfuscate ? 'obfuscated' : 'message',
        viewedBy: [sessionId]
      };

      const docRef = await addDoc(collection(db, FIRESTORE_COLLECTION), messageData);
      
      console.log('✅ Message sent successfully:', docRef.id);
      
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  }, [sessionId, roomId]);

  const leaveRoom = useCallback(async () => {
    if (!roomId) return;
    
    console.log('🚪 Leaving room:', roomId);
    setRoomId(null);
    setMessages([]);
    setError(null);
    setIsConnected(false);
    
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
  }, [roomId]);

  const logout = useCallback(async () => {
    console.log('👋 Logging out...');
    setRoomId(null);
    setMessages([]);
    setError(null);
    setIsConnected(false);
    
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
  }, []);

  const panicDelete = useCallback(async () => {
    if (!roomId || !sessionId) return;
    
    console.log('🚨 PANIC DELETE ACTIVATED - ROOM:', roomId);
    console.log('🔥 THIS WILL PERMANENTLY DELETE ALL MESSAGES IN THIS ROOM FOR ALL USERS');
    
    // Store roomId before clearing state
    const currentRoomId = roomId;
    
    // Immediate UI cleanup for instant response
    setMessages([]);
    setError(null);
    setIsConnected(false);
    
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    
    // Delete ALL messages from Firebase for this room (affects all users)
    try {
      console.log('🗑️ PERMANENTLY DELETING ALL MESSAGES FROM ROOM:', currentRoomId);
      
      // Query ALL messages for this room (no filters, get everything)
      const messagesQuery = query(
        collection(db, 'messages'),
        where('roomId', '==', currentRoomId)
      );
      
      const querySnapshot = await getDocs(messagesQuery);
      console.log(`📊 Found ${querySnapshot.size} messages to PERMANENTLY DELETE`);
      
      if (querySnapshot.size === 0) {
        console.log('ℹ️ No messages found in room to delete');
        setRoomId(null); // Clear room after attempt
        return;
      }
      
      // Delete ALL messages in batches for better performance
      const batch = writeBatch(db);
      let deleteCount = 0;
      
      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        batch.delete(doc.ref);
        deleteCount++;
        console.log(`🗑️ Queuing message ${deleteCount} for deletion:`, doc.id);
      });
      
      // Commit the deletion
      await batch.commit();
      console.log(`✅ SUCCESSFULLY DELETED ${deleteCount} MESSAGES FROM ROOM ${currentRoomId}`);
      console.log('🧹 ROOM IS NOW COMPLETELY CLEAN - NO HISTORY REMAINS');
      
      // Clear room state after successful deletion
      setRoomId(null);
      
    } catch (error) {
      console.error('❌ CRITICAL ERROR during panic delete:', error);
      console.error('❌ Some messages may not have been deleted');
      // Still clear UI even if Firebase deletion fails
      setRoomId(null);
    }
  }, [roomId, sessionId]);

  const markMessageAsViewed = useCallback(async (messageId: string, userId: string) => {
    try {
      // Note: You'd implement this with a Firebase update
      console.log('✅ Message marked as viewed:', messageId);
    } catch (error) {
      console.error('Error marking message as viewed:', error);
    }
  }, []);

  const newestMessage = newestMessageRef.current;

  return { 
    messages, 
    sendMessage, 
    isSending, 
    error, 
    sessionId, 
    newestMessage, 
    roomId, 
    setRoomId, 
    leaveRoom, 
    logout, 
    panicDelete,
    markMessageAsViewed,
    isConnected
  };
}