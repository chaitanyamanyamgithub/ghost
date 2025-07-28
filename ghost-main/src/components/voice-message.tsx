"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceMessageProps {
  message: {
    id: string;
    voiceUrl: string;
    voiceDuration: number;
    playedBy?: string[];
  };
  onMarkAsPlayed: (id: string) => void;
}

export default function VoiceMessage({ message, onMarkAsPlayed }: VoiceMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const playVoice = useCallback(async () => {
    if (!message.voiceUrl) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Create new audio element each time to avoid blob URL issues
      const audio = new Audio();
      audioRef.current = audio;

      audio.preload = 'auto';

      // Handle different audio formats
      let audioSrc = message.voiceUrl;

      // If it's already a data URL, use it directly
      if (message.voiceUrl.startsWith('data:')) {
        audioSrc = message.voiceUrl;
      } else if (message.voiceUrl.startsWith('blob:')) {
        // For blob URLs, we need to handle them carefully
        audioSrc = message.voiceUrl;
      } else {
        // Assume it's base64 and create data URL
        audioSrc = `data:audio/webm;base64,${message.voiceUrl}`;
      }

      audio.src = audioSrc;

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        onMarkAsPlayed(message.id);
        setIsLoading(false);
      };

      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setError('Failed to play voice message');
        setIsPlaying(false);
        setIsLoading(false);
      };

      audio.oncanplaythrough = () => {
        setIsLoading(false);
      };

      audio.onloadstart = () => {
        setIsLoading(true);
      };

      await audio.play();
      setIsPlaying(true);
      setIsLoading(false);

    } catch (error) {
      console.error('Failed to play voice message:', error);
      setError('Unable to play voice message');
      setIsPlaying(false);
      setIsLoading(false);
    }
  }, [message.voiceUrl, message.id, isPlaying, onMarkAsPlayed]);

  const handleProgressClick = useCallback((e: React.MouseEvent) => {
    if (!audioRef.current || !progressRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * message.voiceDuration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [message.voiceDuration]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = message.voiceDuration ? (currentTime / message.voiceDuration) * 100 : 0;

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  if (error) {
    return (
      <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/20 rounded-lg p-3 min-w-[200px] border border-red-200 dark:border-red-800">
        <Volume2 className="h-4 w-4 text-red-500" />
        <span className="text-sm text-red-600 dark:text-red-400">Voice message unavailable</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-3 min-w-[200px] border border-blue-200 dark:border-blue-800">
      <Button
        variant="ghost"
        size="sm"
        onClick={playVoice}
        disabled={isLoading}
        className={cn(
          "h-8 w-8 p-0 rounded-full transition-all",
          isPlaying
            ? "bg-blue-500 text-white hover:bg-blue-600"
            : "bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
        )}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4 ml-0.5" />
        )}
      </Button>

      <div className="flex-1 space-y-1">
        <div
          ref={progressRef}
          className="relative bg-blue-200 dark:bg-blue-800 rounded-full h-2 cursor-pointer"
          onClick={handleProgressClick}
        >
          <div
            className="absolute left-0 top-0 h-2 bg-blue-500 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-blue-600 dark:text-blue-400">
          <span>{formatDuration(currentTime)}</span>
          <span>{formatDuration(message.voiceDuration || 0)}</span>
        </div>
      </div>
    </div>
  );
}