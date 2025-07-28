"use client";

import { useEffect, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Trash2,
  Trash,
  Copy,
  Reply,
  Heart,
  Smile,
  ThumbsUp,
  MoreHorizontal,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageContextMenuProps {
  isVisible: boolean;
  position: { x: number; y: number };
  messageId: string;
  messageText: string;
  isOwnMessage: boolean;
  messageType: 'text' | 'voice' | 'image';
  onClose: () => void;
  onDelete: () => void;
  onDeleteForEveryone: () => void;
  onCopy: () => void;
  onReply: () => void;
  onReact: (emoji: string) => void;
}

const quickReactions = ['❤️', '👍', '😂', '😮', '😢', '🔥'];

export default function MessageContextMenu({
  isVisible,
  position,
  messageId,
  messageText,
  isOwnMessage,
  messageType,
  onClose,
  onDelete,
  onDeleteForEveryone,
  onCopy,
  onReply,
  onReact
}: MessageContextMenuProps) {
  const [mounted, setMounted] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Handle mounting to prevent flash
  useEffect(() => {
    if (isVisible) {
      setMounted(true);
    } else {
      const timer = setTimeout(() => {
        setMounted(false);
        setShowDeleteConfirm(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isVisible) {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-context-menu]')) {
          onClose();
        }
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible, onClose]);

  // Calculate position to stay within viewport
  const getAdjustedPosition = useCallback(() => {
    if (typeof window === 'undefined') return position;

    const menuWidth = 280;
    const menuHeight = showDeleteConfirm ? 300 : 400;
    const padding = 16;

    let x = position.x;
    let y = position.y;

    // Adjust horizontal position
    if (x + menuWidth > window.innerWidth - padding) {
      x = window.innerWidth - menuWidth - padding;
    }
    if (x < padding) {
      x = padding;
    }

    // Adjust vertical position
    if (y + menuHeight > window.innerHeight - padding) {
      y = window.innerHeight - menuHeight - padding;
    }
    if (y < padding) {
      y = padding;
    }

    return { x, y };
  }, [position, showDeleteConfirm]);

  const handleDeleteForMe = () => {
    onDelete();
    onClose();
    setShowDeleteConfirm(false);
  };

  const handleDeleteForEveryone = () => {
    onDeleteForEveryone();
    onClose();
    setShowDeleteConfirm(false);
  };

  if (!mounted) return null;

  const adjustedPosition = getAdjustedPosition();

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 transition-colors duration-150",
          isVisible ? "bg-black/5 dark:bg-black/20" : "bg-transparent pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Context Menu */}
      <Card
        data-context-menu
        className={cn(
          "fixed z-50 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl rounded-xl transition-all duration-150 origin-top-left",
          isVisible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        )}
        style={{
          left: adjustedPosition.x,
          top: adjustedPosition.y,
        }}
      >
        {!showDeleteConfirm ? (
          <>
            {/* Quick Reactions */}
            <div className="p-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Quick Reactions
                </span>
                <MoreHorizontal className="h-3 w-3 text-gray-400" />
              </div>
              <div className="flex gap-1">
                {quickReactions.map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => {
                      onReact(emoji);
                      onClose();
                    }}
                  >
                    <span className="text-lg">{emoji}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Main Actions */}
            <div className="p-2 space-y-1">
              {messageType !== 'voice' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-10 px-3 font-normal text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  onClick={() => {
                    onCopy();
                    onClose();
                  }}
                >
                  <Copy className="h-4 w-4 mr-3 text-gray-500" />
                  <span>Copy Message</span>
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-10 px-3 font-normal text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                onClick={() => {
                  onReply();
                  onClose();
                }}
              >
                <Reply className="h-4 w-4 mr-3 text-gray-500" />
                <span>Reply</span>
              </Button>
            </div>

            <Separator className="mx-2" />

            {/* Delete Actions */}
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-10 px-3 font-normal text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash className="h-4 w-4 mr-3" />
                <span>Delete Message</span>
              </Button>
            </div>
          </>
        ) : (
          /* Delete Confirmation */
          <div className="p-4">
            <div className="text-center mb-4">
              <div className="w-12 h-12 mx-auto mb-3 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Delete Message
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose how you want to delete this message
              </p>
            </div>

            <div className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start min-h-[50px] px-3 font-normal text-sm border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950/20 rounded-lg transition-colors"
                onClick={handleDeleteForMe}
              >
                <Trash className="h-4 w-4 mr-3 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-medium">Delete for me</div>
                  <div className="text-xs opacity-70 mt-1">Remove from your chat only</div>
                </div>
              </Button>

              {isOwnMessage && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start min-h-[50px] px-3 font-normal text-sm border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                  onClick={handleDeleteForEveryone}
                >
                  <Trash2 className="h-4 w-4 mr-3 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium">Delete for everyone</div>
                    <div className="text-xs opacity-70 mt-1">Remove for all participants</div>
                  </div>
                </Button>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-9 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg transition-colors"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}