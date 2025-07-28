"use client";

import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';
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
    failed?: boolean;
  };
  sessionId: string | null;
  isOwnMessage?: boolean;
  className?: string;
}

export default function MessageStatusEnhanced({
  message,
  sessionId,
  isOwnMessage = false,
  className
}: MessageStatusProps) {
  // Don't show status for other people's messages
  if (message.sessionId !== sessionId) return null;

  // Don't show status for deleted messages
  if (message.deletedForEveryone || message.deletedBy?.includes(sessionId || '')) return null;

  const { delivered, viewed, timestamp, failed } = message;

  // Different styling based on message bubble type
  const getStatusColor = () => {
    if (failed) return "text-red-400";

    if (isOwnMessage) {
      // White/light colors for blue message bubbles
      if (viewed) return "text-cyan-200 drop-shadow-sm";
      if (delivered) return "text-white/70";
      if (timestamp) return "text-white/60";
      return "text-white/50";
    } else {
      // Darker colors for light message bubbles
      if (viewed) return "text-emerald-500 font-medium";
      if (delivered) return "text-gray-500";
      if (timestamp) return "text-gray-400";
      return "text-gray-400";
    }
  };

  const renderStatus = () => {
    if (failed) {
      return <AlertCircle className="h-3 w-3" />;
    }

    if (!timestamp) {
      return <Clock className="h-3 w-3 animate-pulse" />;
    }

    if (viewed) {
      return (
        <div className="relative">
          <CheckCheck className="h-3 w-3" />
          {/* Subtle glow effect for read status */}
          <div className="absolute inset-0 h-3 w-3 animate-pulse opacity-30">
            <CheckCheck className="h-3 w-3" />
          </div>
        </div>
      );
    }

    if (delivered) {
      return <CheckCheck className="h-3 w-3" />;
    }

    return <Check className="h-3 w-3" />;
  };

  return (
    <div className={cn(
      "flex items-center gap-1 text-xs transition-all duration-200",
      getStatusColor(),
      className
    )}>
      {renderStatus()}
    </div>
  );
}