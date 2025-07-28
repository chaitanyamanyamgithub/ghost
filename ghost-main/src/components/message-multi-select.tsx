"use client";

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Trash2,
  Trash,
  Copy,
  CheckSquare,
  Square,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageMultiSelectProps {
  isActive: boolean;
  selectedMessageIds: string[];
  allMessageIds: string[];
  onToggleMessage: (messageId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  onDeleteForEveryoneSelected: () => void;
  onCopySelected: () => void;
  onClose: () => void;
}

export default function MessageMultiSelect({
  isActive,
  selectedMessageIds,
  allMessageIds,
  onToggleMessage,
  onSelectAll,
  onClearSelection,
  onDeleteSelected,
  onDeleteForEveryoneSelected,
  onCopySelected,
  onClose
}: MessageMultiSelectProps) {
  const selectedCount = selectedMessageIds.length;
  const allSelected = selectedCount === allMessageIds.length && allMessageIds.length > 0;

  if (!isActive) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg border-b border-blue-500">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Selection info and controls */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-white hover:bg-white/10 rounded-full transition-colors"
              title="Exit selection mode"
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-3">
              <Badge
                variant="secondary"
                className="bg-white/20 text-white border-white/30 px-3 py-1 font-medium"
              >
                {selectedCount} selected
              </Badge>

              <Button
                variant="ghost"
                size="sm"
                onClick={allSelected ? onClearSelection : onSelectAll}
                className="h-8 px-3 text-white hover:bg-white/10 text-xs font-medium rounded-md transition-colors"
              >
                {allSelected ? (
                  <>
                    <Square className="h-3.5 w-3.5 mr-2" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-3.5 w-3.5 mr-2" />
                    Select All
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Right side - Actions */}
          {selectedCount > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onCopySelected}
                className="h-8 px-3 text-white hover:bg-white/10 text-xs font-medium rounded-md transition-colors"
                title="Copy selected messages"
              >
                <Copy className="h-3.5 w-3.5 mr-2" />
                <span className="hidden sm:inline">Copy</span>
              </Button>

              <div className="h-4 w-px bg-white/30 mx-1" />

              <Button
                variant="ghost"
                size="sm"
                onClick={onDeleteSelected}
                className="h-8 px-3 text-orange-200 hover:text-orange-100 hover:bg-orange-500/20 text-xs font-medium rounded-md transition-colors"
                title="Delete for me"
              >
                <Trash className="h-3.5 w-3.5 mr-2" />
                <span className="hidden sm:inline">Delete for Me</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onDeleteForEveryoneSelected}
                className="h-8 px-3 text-red-200 hover:text-red-100 hover:bg-red-500/20 text-xs font-medium rounded-md transition-colors"
                title="Delete for everyone"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                <span className="hidden sm:inline">Delete for Everyone</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white hover:bg-white/10 rounded-md transition-colors"
                title="More options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}