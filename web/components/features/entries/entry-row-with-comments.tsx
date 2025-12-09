'use client';

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Entry } from '@/lib/api';
import type { BudgetMember } from '@/lib/comment-types';
import { EntryDetailsDialog } from './entry-details-dialog';

interface EntryRowWithCommentsProps {
  entry: Entry;
  budgetId: string;
  budgetMembers: BudgetMember[];
  currentUserId: string;
  canComment: boolean;
  children: React.ReactNode;
}

export function EntryRowWithComments({
  entry,
  budgetId,
  budgetMembers,
  currentUserId,
  canComment,
  children,
}: EntryRowWithCommentsProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors group">
        {children}
        <td className="py-3 px-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(true)}
            className="relative"
          >
            <MessageSquare className="h-4 w-4" />
            {(entry.comment_count || 0) > 0 && (
              <Badge
                variant="secondary"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]"
              >
                {entry.comment_count}
              </Badge>
            )}
          </Button>
        </td>
      </tr>

      <EntryDetailsDialog
        entry={entry}
        budgetId={budgetId}
        budgetMembers={budgetMembers}
        currentUserId={currentUserId}
        canComment={canComment}
        open={showDetails}
        onOpenChange={setShowDetails}
      />
    </>
  );
}
