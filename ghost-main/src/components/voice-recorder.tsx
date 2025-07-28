"use client";

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Send, Trash2, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onSendVoice: (audioData: string, duration: number) => void; // Changed to string
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  disabled?: boolean;
}

export default function VoiceRecorder({
  onSendVoice,
  isRecording,
  onStartRecording,
  onStopRecording,
  disabled = false
}: VoiceRecorderProps) {
  const [audioData, setAudioData] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      // Check for supported MIME types
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = ''; // Use default
          }
        }
      }

      const options = mimeType ? { mimeType } : {};
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: mimeType || 'audio/webm' });

        // Convert blob to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setAudioData(base64);
        };
        reader.onerror = () => {
          console.error('Failed to convert audio to base64');
          alert('Failed to process voice recording');
        };
        reader.readAsDataURL(blob);

        // Clean up stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100);
      startTimeRef.current = Date.now();
      onStartRecording();

      // Update duration timer
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);
      }, 100);

    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Microphone access denied. Please allow microphone access to record voice messages.');
    }
  }, [onStartRecording]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      onStopRecording();

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording, onStopRecording]);

  const playPreview = useCallback(() => {
    if (audioData && !isPlaying) {
      try {
        const audio = new Audio(audioData);
        audioRef.current = audio;

        audio.onended = () => {
          setIsPlaying(false);
        };

        audio.onerror = (error) => {
          console.error('Audio playback error:', error);
          setIsPlaying(false);
        };

        audio.play().then(() => {
          setIsPlaying(true);
        }).catch((error) => {
          console.error('Failed to play audio:', error);
          setIsPlaying(false);
        });
      } catch (error) {
        console.error('Failed to create audio element:', error);
        setIsPlaying(false);
      }
    } else if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [audioData, isPlaying]);

  const sendVoice = useCallback(() => {
    if (audioData && duration > 0) {
      onSendVoice(audioData, duration);
      setAudioData(null);
      setDuration(0);
    }
  }, [audioData, duration, onSendVoice]);

  const deleteRecording = useCallback(() => {
    setAudioData(null);
    setDuration(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show recording interface
  if (isRecording) {
    return (
      <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 rounded-lg p-2 border border-red-200 dark:border-red-800">
        <Button
          variant="destructive"
          size="sm"
          onMouseUp={stopRecording}
          onTouchEnd={stopRecording}
          className="h-8 w-8 p-0 animate-pulse"
        >
          <MicOff className="h-4 w-4" />
        </Button>

        <div className="flex-1 text-sm">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1 h-1 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1 h-1 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-red-600 dark:text-red-400 font-medium">
              Recording... {formatDuration(duration)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Show preview interface
  if (audioData) {
    return (
      <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg p-2 border border-blue-200 dark:border-blue-800">
        <Button
          variant="ghost"
          size="sm"
          onClick={playPreview}
          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>

        <div className="flex-1 text-sm">
          <div className="flex items-center gap-2">
            <div className="bg-blue-200 dark:bg-blue-800 rounded-full h-2 flex-1">
              <div className="bg-blue-500 h-2 rounded-full w-full" />
            </div>
            <span className="text-xs text-blue-600 dark:text-blue-400">
              {formatDuration(duration)}
            </span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={deleteRecording}
          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={sendVoice}
          className="h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Show record button
  return (
    <Button
      variant="ghost"
      size="sm"
      onMouseDown={startRecording}
      onTouchStart={startRecording}
      disabled={disabled}
      className="h-10 w-10 p-0 hover:bg-blue-50 dark:hover:bg-blue-950/20"
      title="Hold to record voice message"
    >
      <Mic className="h-4 w-4 text-blue-500" />
    </Button>
  );
}