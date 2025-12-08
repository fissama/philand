'use client';

import { useEffect, useRef } from 'react';
import type { BudgetMember } from '@/lib/comment-types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MentionSelectorProps {
  members: BudgetMember[];
  selected: string[];
  onChange: (selected: string[]) => void;
  onClose: () => void;
}

export function MentionSelector({
  members,
  selected,
  onChange,
  onClose,
}: MentionSelectorProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const toggleMember = (userId: string) => {
    if (selected.includes(userId)) {
      onChange(selected.filter((id) => id !== userId));
    } else {
      onChange([...selected, userId]);
    }
  };

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 z-50 mb-2 w-72 rounded-lg border bg-white shadow-lg"
    >
      <div className="border-b p-3">
        <h4 className="text-sm font-semibold">Select members to mention</h4>
      </div>
      <ScrollArea className="max-h-64">
        <div className="p-2">
          {members.map((member) => (
            <label
              key={member.user_id}
              className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-gray-50"
            >
              <Checkbox
                checked={selected.includes(member.user_id)}
                onCheckedChange={() => toggleMember(member.user_id)}
              />
              <Avatar className="h-8 w-8">
                <AvatarImage src={member.user_avatar || undefined} />
                <AvatarFallback>
                  {member.user_name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <div className="truncate text-sm font-medium">
                  {member.user_name}
                </div>
                <div className="truncate text-xs text-gray-500">
                  {member.user_email}
                </div>
              </div>
            </label>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
