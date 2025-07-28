"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Timer, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DisappearTimerProps {
  onTimerSelect: (seconds: number | undefined) => void;
  selectedTimer?: number;
  disabled?: boolean;
}

const TIMER_OPTIONS = [
  { label: 'Off', value: undefined, icon: '∞' },
  { label: '30 seconds', value: 30, icon: '30s' },
  { label: '1 minute', value: 60, icon: '1m' },
  { label: '5 minutes', value: 300, icon: '5m' },
  { label: '10 minutes', value: 600, icon: '10m' },
  { label: '1 hour', value: 3600, icon: '1h' },
  { label: '24 hours', value: 86400, icon: '24h' }
];

export default function DisappearTimer({
  onTimerSelect,
  selectedTimer,
  disabled = false
}: DisappearTimerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = TIMER_OPTIONS.find(option => option.value === selectedTimer);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className={cn(
            "h-10 px-2 text-xs",
            selectedTimer && "text-orange-500 bg-orange-50 dark:bg-orange-950/20"
          )}
        >
          <Timer className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">
            {selectedOption?.icon || '∞'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {TIMER_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value || 'off'}
            onClick={() => {
              onTimerSelect(option.value);
              setIsOpen(false);
            }}
            className={cn(
              "flex items-center justify-between",
              selectedTimer === option.value && "bg-accent"
            )}
          >
            <span>{option.label}</span>
            <span className="text-xs text-muted-foreground">{option.icon}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}