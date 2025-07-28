"use client";

import { useState, useEffect } from 'react';

export function useSessionId() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // This code block runs only on the client-side after hydration.
    let id = sessionStorage.getItem('stealthspeak-session-id');
    if (!id) {
      // Use a simple random string for session identification.
      // This is sufficient for distinguishing messages in the chat UI.
      id = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem('stealthspeak-session-id', id);
    }
    setSessionId(id);
  }, []);

  return sessionId;
}
