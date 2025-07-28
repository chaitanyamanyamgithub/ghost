"use client";

import { createContext, useContext, type ReactNode } from 'react';
import { useChat, type Message } from '@/hooks/use-chat';

type ChatContextType = {
  messages: Message[];
  sendMessage: (text: string, disappearTimer?: number) => Promise<void>;
  sendVoiceMessage: (voiceData: string, duration: number, disappearTimer?: number) => Promise<void>;
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  markVoiceAsPlayed: (messageId: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  deleteMessages: (messageIds: string[]) => Promise<void>;
  deleteMessageForEveryone: (messageId: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  logout: () => Promise<void>;
  panicDelete: (targetRoomId?: string) => Promise<void>;
  isSending: boolean;
  error: string | null;
  sessionId: string;
  newestMessage: Message | null;
  roomId: string | null;
  setRoomId: (roomId: string) => void;
  isConnected: boolean;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const chat = useChat();
  return <ChatContext.Provider value={chat}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
