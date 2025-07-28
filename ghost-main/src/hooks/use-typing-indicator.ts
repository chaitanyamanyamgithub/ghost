"use client";

import { useState, useEffect, useCallback } from 'react';

export function useTypingIndicator(roomId: string | null, sessionId: string | null) {
  const [typingUsers, setTypingUsers] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const indicateTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      // In a real app, you'd send typing indicator to other users
      setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    }
  }, [isTyping]);

  const stopTyping = useCallback(() => {
    setIsTyping(false);
    // In a real app, you'd stop typing indicator
  }, []);

  return {
    typingUsers,
    indicateTyping,
    stopTyping,
    isTyping
  };
}
