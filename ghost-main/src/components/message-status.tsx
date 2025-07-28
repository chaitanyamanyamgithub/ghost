"use client";

import { Check, CheckCheck, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageStatusProps {
  message: {
    id: string;
    sessionId: string;
    timestamp: Date | null;
    delivered: boolean;
    viewed: boolean;
    deliveredAt?: Date;
    viewedAt?: Date;
    deletedForEveryone?: boolean;
    deletedBy?: string[];
  };
  sessionId: string | null;
  className?: string;
}

export default function MessageStatus({ message, sessionId, className }: MessageStatusProps) {
  // Don't show status for other people's messages
  if (message.sessionId !== sessionId) return null;

  // Don't show status for deleted messages
  if (message.deletedForEveryone || message.deletedBy?.includes(sessionId || '')) return null;

  const { delivered, viewed, timestamp } = message;

  return (
    <div className={cn("flex items-center gap-1 text-xs", className)}>
      {!timestamp ? (
        // Sending - Clock with pulse animation
        <Clock className="h-3 w-3 text-gray-400 animate-pulse" />
      ) : viewed ? (
        // Read - Double tick with bright blue color and subtle glow
        <div className="relative">
          <CheckCheck className="h-3 w-3 text-blue-400 drop-shadow-sm" />
          <CheckCheck className="h-3 w-3 text-blue-600 absolute inset-0 animate-pulse opacity-50" />
        </div>
      ) : delivered ? (
        // Delivered - Double tick gray
        <CheckCheck className="h-3 w-3 text-gray-400" />
      ) : (
        // Sent - Single tick gray
        <Check className="h-3 w-3 text-gray-400" />
      )}
    </div>
  );
}