"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { useChatContext } from '@/contexts/chat-provider';
import { useToast } from '@/hooks/use-toast';
import BlogView from './blog-view';
import LoginView from './login-view';
import ChatView from './chat-view';
import PanicView from './panic-view';
import Header from './header';
import { cn } from '@/lib/utils';

type View = 'blog' | 'login' | 'chat' | 'panic';

const LOGO_CLICK_UNLOCK_COUNT = 3;
const SECRET_ROOM_PASSWORD = "ghost";

export default function MainPage() {
  const [view, setView] = useState<View>('blog');
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const { newestMessage, sessionId, setRoomId, roomId, leaveRoom, logout, panicDelete } = useChatContext();
  const lastNotifiedMessageId = useRef<string | null>(null);

  const handleUnlock = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setView('login');
      setIsTransitioning(false);
    }, 150);
  }, []);

  const handleLoginSuccess = useCallback((password: string) => {
    setIsTransitioning(true);

    setTimeout(() => {
      if (password === SECRET_ROOM_PASSWORD) {
        const secretRoomId = 'secret_ghost_room_2024';
        setRoomId(secretRoomId);
        setView('chat');
        toast({
          title: "🔐 Secret Room Active",
          description: "Connected to secure private room",
          duration: 2000,
        });
      } else {
        setRoomId(password);
        setView('chat');
        toast({
          title: "💬 Connected",
          description: "Secure chat room active",
          duration: 1500,
        });
      }
      setIsTransitioning(false);
    }, 150);
  }, [setRoomId, toast]);

  // Close button - smooth transition
  const handleClose = useCallback(async () => {
    setIsTransitioning(true);

    setTimeout(async () => {
      setView('blog');

      if (roomId) {
        try {
          await leaveRoom();
        } catch (error) {
          console.error('Error during room leave:', error);
        }
      }
      setIsTransitioning(false);
    }, 150);
  }, [roomId, leaveRoom]);

  // Panic button - instant transition
  const handlePanic = useCallback(async () => {
    // INSTANTLY go to blog page with no transition delay
    setView('blog');
    setIsTransitioning(false);

    // Clear messages in background
    if (roomId) {
      try {
        await panicDelete();
        toast({
          title: "🚨 Emergency Complete",
          description: "All data cleared successfully",
          duration: 2000,
        });
      } catch (error) {
        console.error('Panic delete failed:', error);
        toast({
          title: "⚠️ Emergency Mode",
          description: "Session terminated",
          duration: 2000,
          variant: "destructive"
        });
      }
    }
  }, [roomId, panicDelete, toast]);

  // Handle logo clicks for secret room unlock - no hints
  const handleLogoClick = useCallback(() => {
    if (view === 'chat') return;

    const newCount = logoClickCount + 1;
    setLogoClickCount(newCount);

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    if (newCount >= LOGO_CLICK_UNLOCK_COUNT) {
      setLogoClickCount(0);
      handleUnlock();
      // Removed the hint toast - keep it secret
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        setLogoClickCount(0);
      }, 2000);
    }
  }, [logoClickCount, view, handleUnlock]);

  // Global panic shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'X') {
        handlePanic();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePanic]);

  // Reset when room is cleared
  useEffect(() => {
    if (!roomId && (view === 'chat' || view === 'panic')) {
      setView('blog');
    }
  }, [roomId, view]);

  // Handle notifications for new messages
  useEffect(() => {
    if (newestMessage && newestMessage.sessionId !== sessionId && newestMessage.id !== lastNotifiedMessageId.current) {
      if (newestMessage.type === 'message' && (view !== 'chat' || document.hidden) && newestMessage.roomId === roomId && roomId) {
        lastNotifiedMessageId.current = newestMessage.id;

        const isSecretRoom = roomId === 'secret_ghost_room_2024';

        toast({
          title: isSecretRoom ? "🔐 Secret Message" : "💬 New Message",
          description: isSecretRoom ? "You have a secure message" : "You have a new message",
          duration: 4000,
          onClick: () => {
            if (roomId) {
              setView('chat');
            } else {
              setView('login');
            }
          },
          className: "cursor-pointer hover:bg-secondary transition-colors"
        });
      }
    }
  }, [newestMessage, sessionId, view, toast, roomId]);

  const renderView = () => {
    if (isTransitioning) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    switch (view) {
      case 'login':
        return <LoginView onLoginSuccess={handleLoginSuccess} />;
      case 'chat':
        return (
          <ChatView
            onPanic={handlePanic}
            onClose={handleClose}
            isSecretRoom={roomId === 'secret_ghost_room_2024'}
          />
        );
      case 'panic':
        return <PanicView />;
      case 'blog':
      default:
        return <BlogView />;
    }
  };

  // Don't show header in chat view
  const showHeader = view !== 'chat';

  return (
    <div className="min-h-screen bg-background">
      {showHeader && !isTransitioning && (
        <Header onLogoClick={handleLogoClick} />
      )}

      <main className={cn(
        "transition-all duration-200",
        showHeader && !isTransitioning ? "pt-16" : "",
        view === 'chat' ? "h-screen" : "min-h-screen"
      )}>
        {renderView()}
      </main>
    </div>
  );
}
