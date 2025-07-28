"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useChatContext } from '@/contexts/chat-provider';
import { useTypingIndicator } from '@/hooks/use-typing-indicator';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Send, AlertTriangle, Bot, UserPlus, ShieldAlert, Check, CheckCheck, Lock, Shield, X, Clock, Play, Pause, Smile, Timer, MoreVertical, CheckSquare } from 'lucide-react';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import VoiceRecorder from './voice-recorder';
import DisappearTimer from './disappear-timer';
import VoiceMessage from './voice-message';
import MessageContextMenu from './message-context-menu';
import MessageMultiSelect from './message-multi-select';
import MessageStatus from './message-status';
import MessageStatusEnhanced from './message-status-enhanced';

function TypingIndicator({ typingUsers }: { typingUsers: any[] }) {
  if (typingUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground italic px-3 py-2 bg-background/80 backdrop-blur-sm">
      <div className="flex gap-1">
        <div className="w-1 h-1 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-1 h-1 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-1 h-1 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <span>Someone is typing...</span>
    </div>
  );
}

function MessageTime({ message }: { message: any }) {
  const formatTime = (date: Date) => {
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM dd, HH:mm');
    }
  };

  return (
    <span className="text-xs opacity-75">
      {message.timestamp ? formatTime(message.timestamp) : 'Sending...'}
    </span>
  );
}

function DisappearingTimer({ disappearAt }: { disappearAt?: Date }) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!disappearAt) return;

    const updateTimer = () => {
      const now = Date.now();
      const timeUntilDisappear = disappearAt.getTime() - now;

      if (timeUntilDisappear <= 0) {
        setTimeLeft('Disappeared');
        return;
      }

      const hours = Math.floor(timeUntilDisappear / (1000 * 60 * 60));
      const minutes = Math.floor((timeUntilDisappear % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeUntilDisappear % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [disappearAt]);

  if (!disappearAt || !timeLeft) return null;

  return (
    <div className="flex items-center gap-1 text-xs text-orange-500">
      <Timer className="h-3 w-3" />
      <span>{timeLeft}</span>
    </div>
  );
}

function MessageReactions({ reactions, onAddReaction, messageId }: {
  reactions: any[],
  onAddReaction: (messageId: string, emoji: string) => void,
  messageId: string
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🔥'];

  const reactionCounts = reactions.reduce((acc, reaction) => {
    acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (Object.keys(reactionCounts).length === 0 && !showEmojiPicker) {
    return (
      <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Smile className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="grid grid-cols-4 gap-1">
            {commonEmojis.map(emoji => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-base hover:bg-muted"
                onClick={() => {
                  onAddReaction(messageId, emoji);
                  setShowEmojiPicker(false);
                }}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className="flex items-center gap-1 mt-1 flex-wrap">
      {Object.entries(reactionCounts).map(([emoji, count]) => (
        <Button
          key={emoji}
          variant="outline"
          size="sm"
          className="h-6 px-2 text-xs bg-muted/50 border-muted hover:bg-muted/80 transition-colors"
          onClick={() => onAddReaction(messageId, emoji)}
        >
          {emoji} {count as number}
        </Button>
      ))}

      <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-muted/50 transition-colors">
            <Smile className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="grid grid-cols-4 gap-1">
            {commonEmojis.map(emoji => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-base hover:bg-muted"
                onClick={() => {
                  onAddReaction(messageId, emoji);
                  setShowEmojiPicker(false);
                }}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface ChatViewProps {
  onPanic: () => void;
  onClose: () => void;
  isSecretRoom?: boolean;
}

export default function ChatView({ onPanic, onClose, isSecretRoom = false }: ChatViewProps) {
  const [text, setText] = useState('');
  const [disappearTimer, setDisappearTimer] = useState<number | undefined>();
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    isVisible: boolean;
    position: { x: number; y: number };
    messageId: string;
    messageText: string;
    isOwnMessage: boolean;
    messageType: 'text' | 'voice' | 'image';
  }>({
    isVisible: false,
    position: { x: 0, y: 0 },
    messageId: '',
    messageText: '',
    isOwnMessage: false,
    messageType: 'text'
  });

  // Multi-select state
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<Set<string>>(new Set());
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const {
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
    roomId,
    isConnected
  } = useChatContext();

  const { typingUsers, indicateTyping, stopTyping } = useTypingIndicator(roomId, sessionId);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Perfect focus management
  const focusTextarea = useCallback(() => {
    if (textareaRef.current && !isMultiSelectMode) {
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });
    }
  }, [isMultiSelectMode]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Focus on mount and when switching from multi-select
  useEffect(() => {
    focusTextarea();
  }, [focusTextarea]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle window focus to refocus textarea
  useEffect(() => {
    const handleFocus = () => {
      if (!isMultiSelectMode) {
        focusTextarea();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isMultiSelectMode, focusTextarea]);

  // Handle message selection
  const handleToggleMessageSelection = useCallback((messageId: string) => {
    setSelectedMessageIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  }, []);

  // Handle select all messages
  const handleSelectAllMessages = useCallback(() => {
    const allMessageIds = messages.map(m => m.id);
    setSelectedMessageIds(new Set(allMessageIds));
  }, [messages]);

  // Handle clear selection and restore focus
  const handleClearSelection = useCallback(() => {
    setSelectedMessageIds(new Set());
    setIsMultiSelectMode(false);
    setTimeout(() => {
      focusTextarea();
    }, 100);
  }, [focusTextarea]);

  // Handle context menu
  const handleContextMenu = useCallback((
    e: React.MouseEvent,
    messageId: string,
    messageText: string,
    isOwnMessage: boolean,
    messageType: 'text' | 'voice' | 'image'
  ) => {
    e.preventDefault();
    setContextMenu({
      isVisible: true,
      position: { x: e.clientX, y: e.clientY },
      messageId,
      messageText,
      isOwnMessage,
      messageType
    });
  }, []);

  // Handle long press for mobile (3 seconds)
  const handleLongPressStart = useCallback((
    messageId: string,
    messageText: string,
    isOwnMessage: boolean,
    messageType: 'text' | 'voice' | 'image'
  ) => {
    const timer = setTimeout(() => {
      if (!isMultiSelectMode) {
        setIsMultiSelectMode(true);
        setSelectedMessageIds(new Set([messageId]));
      } else {
        handleToggleMessageSelection(messageId);
      }

      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    }, 3000);

    setLongPressTimer(timer);
  }, [isMultiSelectMode, handleToggleMessageSelection]);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  // Context menu actions
  const handleDeleteMessage = useCallback(async () => {
    if (contextMenu.messageId) {
      await deleteMessage(contextMenu.messageId);
    }
  }, [contextMenu.messageId, deleteMessage]);

  const handleDeleteMessageForEveryone = useCallback(async () => {
    if (contextMenu.messageId) {
      await deleteMessageForEveryone(contextMenu.messageId);
    }
  }, [contextMenu.messageId, deleteMessageForEveryone]);

  const handleCopyMessage = useCallback(() => {
    if (contextMenu.messageText) {
      navigator.clipboard.writeText(contextMenu.messageText);
    }
  }, [contextMenu.messageText]);

  const handleReplyMessage = useCallback(() => {
    console.log('Reply to message:', contextMenu.messageId);
  }, [contextMenu.messageId]);

  const handleReactToMessage = useCallback((emoji: string) => {
    if (contextMenu.messageId) {
      addReaction(contextMenu.messageId, emoji);
    }
  }, [contextMenu.messageId, addReaction]);

  // Multi-select actions
  const handleDeleteSelectedMessages = useCallback(async () => {
    const messageIds = Array.from(selectedMessageIds);
    await deleteMessages(messageIds);
    handleClearSelection();
  }, [selectedMessageIds, deleteMessages, handleClearSelection]);

  const handleDeleteForEveryoneSelected = useCallback(async () => {
    const messageIds = Array.from(selectedMessageIds);
    await deleteMessages(messageIds);
    handleClearSelection();
  }, [selectedMessageIds, deleteMessages, handleClearSelection]);

  const handleCopySelectedMessages = useCallback(() => {
    const selectedMessages = messages.filter(m => selectedMessageIds.has(m.id));
    const text = selectedMessages.map(m => m.text).join('\n');
    navigator.clipboard.writeText(text);
    handleClearSelection();
  }, [messages, selectedMessageIds, handleClearSelection]);

  // Handlers
  const handlePanicClick = () => {
    onPanic();
  };

  const handleCloseClick = () => {
    onClose();
  };

  const handleSendMessage = useCallback(async () => {
    if (!text.trim() || isSending) return;

    const messageText = text.trim();
    setText('');
    stopTyping();

    await sendMessage(messageText, disappearTimer);

    focusTextarea();
    scrollToBottom();
  }, [text, isSending, sendMessage, disappearTimer, stopTyping, focusTextarea, scrollToBottom]);

  const handleSendVoice = useCallback(async (audioData: string, duration: number) => {
    await sendVoiceMessage(audioData, duration, disappearTimer);

    focusTextarea();
    scrollToBottom();
  }, [sendVoiceMessage, disappearTimer, focusTextarea, scrollToBottom]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);

    if (newText.trim()) {
      indicateTyping();
    } else {
      stopTyping();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Context Menu */}
      <MessageContextMenu
        isVisible={contextMenu.isVisible}
        position={contextMenu.position}
        messageId={contextMenu.messageId}
        messageText={contextMenu.messageText}
        isOwnMessage={contextMenu.isOwnMessage}
        messageType={contextMenu.messageType}
        onClose={() => {
          setContextMenu({ ...contextMenu, isVisible: false });
          focusTextarea();
        }}
        onDelete={handleDeleteMessage}
        onDeleteForEveryone={handleDeleteMessageForEveryone}
        onCopy={handleCopyMessage}
        onReply={handleReplyMessage}
        onReact={handleReactToMessage}
      />

      {/* Multi-select header */}
      <MessageMultiSelect
        isActive={isMultiSelectMode}
        selectedMessageIds={Array.from(selectedMessageIds)}
        allMessageIds={messages.map(m => m.id)}
        onToggleMessage={handleToggleMessageSelection}
        onSelectAll={handleSelectAllMessages}
        onClearSelection={handleClearSelection}
        onDeleteSelected={handleDeleteSelectedMessages}
        onDeleteForEveryoneSelected={handleDeleteForEveryoneSelected}
        onCopySelected={handleCopySelectedMessages}
        onClose={handleClearSelection}
      />

      {/* STICKY HEADER - Like WhatsApp */}
      <div className={cn(
        "sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm",
        isMultiSelectMode ? "pt-14" : ""
      )}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {isSecretRoom ? (
              <div className="relative">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Lock className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-800"></div>
              </div>
            ) : (
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h1 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                {isSecretRoom ? 'Secret Room' : 'Secure Chat'}
              </h1>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  isConnected ? "bg-green-500" : "bg-red-500 animate-pulse"
                )} />
                <span>{isConnected ? 'Connected' : 'Connecting...'}</span>
                {roomId && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-xs">
                      {isSecretRoom ? 'SECRET' : roomId.slice(-6)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-1">
            {!isMultiSelectMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMultiSelectMode(true)}
                className="h-8 w-8 p-0 text-gray-600 dark:text-gray-300"
              >
                <CheckSquare className="h-4 w-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleCloseClick}
              className="h-8 w-8 p-0 text-gray-600 dark:text-gray-300"
            >
              <X className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handlePanicClick}
              className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <ShieldAlert className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Timer Info */}
        {disappearTimer && (
          <div className="px-4 pb-2">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 dark:bg-orange-950/20 px-2 py-1 rounded-full">
                <Timer className="h-3 w-3" />
                <span>Auto-delete: {disappearTimer < 60 ? `${disappearTimer}s` : `${Math.floor(disappearTimer / 60)}m`}</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="px-4 pb-2">
            <Alert variant="destructive" className="text-xs py-2">
              <AlertTriangle className="h-3 w-3" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          </div>
        )}
      </div>

      {/* MESSAGES AREA - Scrollable content */}
      <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
        <div className="h-full overflow-y-auto px-4 py-2" style={{ paddingBottom: '8px' }}>
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4 max-w-xs">
                {isSecretRoom ? (
                  <>
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                      <Lock className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">Secret Room Active</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Private secure room with voice messages and disappearing messages.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                      <Bot className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Start Chatting</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Send messages, voice notes, and reactions. All communications are encrypted.
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3 pb-2">
              {messages.map((message) => {
                const isOwnMessage = message.sessionId === sessionId;
                const isSystemMessage = message.type === 'system';
                const isSelected = selectedMessageIds.has(message.id);

                if (isSystemMessage) {
                  return (
                    <div key={message.id} className="flex justify-center my-4">
                      <div className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-3 py-1.5 rounded-full">
                        <UserPlus className="h-3 w-3 inline mr-1" />
                        {message.text}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex w-full group",
                      isOwnMessage ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className={cn(
                      "flex items-end gap-2 max-w-[85%] sm:max-w-[75%]"
                    )}>
                      {/* Selection checkbox */}
                      {isMultiSelectMode && (
                        <Button
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          className="h-6 w-6 p-0 flex-shrink-0 rounded-full"
                          onClick={() => handleToggleMessageSelection(message.id)}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                        </Button>
                      )}

                      <div
                        className={cn(
                          "relative px-3 py-2 rounded-2xl shadow-sm max-w-full",
                          isOwnMessage
                            ? "bg-blue-500 text-white rounded-br-md"
                            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md border border-gray-200 dark:border-gray-700",
                          isSecretRoom && "ring-1 ring-green-400/30",
                          isSelected && "ring-2 ring-blue-400 ring-offset-1",
                          "transition-all duration-200 hover:shadow-md"
                        )}
                        onContextMenu={(e) => !isMultiSelectMode && handleContextMenu(
                          e,
                          message.id,
                          message.text,
                          isOwnMessage,
                          message.type === 'message' ? 'text' : message.type === 'system' ? 'text' : message.type
                        )}
                        onTouchStart={() => !isMultiSelectMode && handleLongPressStart(
                          message.id,
                          message.text,
                          isOwnMessage,
                          message.type === 'message' ? 'text' : message.type === 'system' ? 'text' : message.type
                        )}
                        onTouchEnd={handleLongPressEnd}
                        onMouseDown={() => !isMultiSelectMode && handleLongPressStart(
                          message.id,
                          message.text,
                          isOwnMessage,
                          message.type === 'message' ? 'text' : message.type === 'system' ? 'text' : message.type
                        )}
                        onMouseUp={handleLongPressEnd}
                        onMouseLeave={handleLongPressEnd}
                        onClick={() => isMultiSelectMode && handleToggleMessageSelection(message.id)}
                      >
                        {message.type === 'voice' ? (
                          <VoiceMessage
                            message={{
                              id: message.id,
                              voiceUrl: message.voiceData || '',
                              voiceDuration: message.voiceDuration || 0,
                              playedBy: message.playedBy
                            }}
                            onMarkAsPlayed={markVoiceAsPlayed}
                          />
                        ) : (
                          <div className="space-y-1">
                            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                              {message.text}
                            </p>

                            <div className="flex items-end justify-between gap-2 mt-1">
                              <div className="flex items-center gap-1 text-xs opacity-70">
                                <MessageTime message={message} />
                                <DisappearingTimer disappearAt={message.disappearAt} />
                              </div>

                              <div className="flex items-center gap-1">
                                {/* Use enhanced message status */}
                                <MessageStatusEnhanced
                                  message={message}
                                  sessionId={sessionId}
                                  isOwnMessage={isOwnMessage}
                                  className="transition-all duration-200"
                                />
                                {!isMultiSelectMode && !isSystemMessage && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                      "h-4 w-4 p-0 opacity-0 group-hover:opacity-70 transition-opacity",
                                      isOwnMessage
                                        ? "text-white/70 hover:text-white/90"
                                        : "text-gray-500 hover:text-gray-700"
                                    )}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleContextMenu(
                                        e as any,
                                        message.id,
                                        message.text,
                                        isOwnMessage,
                                        message.type === 'message' ? 'text' : message.type === 'system' ? 'text' : message.type
                                      );
                                    }}
                                  >
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Reactions */}
                        {!isMultiSelectMode && (
                          <MessageReactions
                            reactions={message.reactions || []}
                            onAddReaction={addReaction}
                            messageId={message.id}
                          />
                        )}

                        {/* Secret room indicator */}
                        {isSecretRoom && !isOwnMessage && (
                          <div className="absolute -top-1 -left-1">
                            <div className="bg-green-500 rounded-full p-0.5">
                              <Lock className="h-2 w-2 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              <TypingIndicator typingUsers={typingUsers} />

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* STICKY FOOTER - Input Area Like WhatsApp */}
      {!isMultiSelectMode && (
        <div className="sticky bottom-0 z-20 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3">
          {/* Timer Controls */}
          <div className="flex items-center justify-between mb-2">
            <DisappearTimer
              onTimerSelect={setDisappearTimer}
              selectedTimer={disappearTimer}
              disabled={isSending}
            />
            {disappearTimer && (
              <div className="text-xs text-orange-600 dark:text-orange-400">
                Auto-delete: {disappearTimer < 60 ? `${disappearTimer}s` : `${Math.floor(disappearTimer / 60)}m`}
              </div>
            )}
          </div>

          {/* Input Row */}
          <div className="flex items-end gap-2">
            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 flex items-center gap-2">
              <Textarea
                ref={textareaRef}
                value={text}
                onChange={handleTextChange}
                onKeyPress={handleKeyPress}
                placeholder={isSecretRoom ? "Type a secret message..." : "Type your message..."}
                className="flex-1 bg-transparent border-0 resize-none text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-0 focus:outline-none max-h-20 min-h-[20px]"
                disabled={isSending}
                rows={1}
                style={{ height: 'auto' }}
              />

              <VoiceRecorder
                onSendVoice={handleSendVoice}
                isRecording={isRecordingVoice}
                onStartRecording={() => setIsRecordingVoice(true)}
                onStopRecording={() => setIsRecordingVoice(false)}
                disabled={isSending}
              />
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={!text.trim() || isSending}
              size="sm"
              className="h-10 w-10 p-0 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-md transition-all duration-200 hover:scale-105"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Secret room info */}
          {isSecretRoom && (
            <div className="text-center mt-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                <Lock className="h-3 w-3" />
                Secret room • Voice messages • Auto-delete • Reactions
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
