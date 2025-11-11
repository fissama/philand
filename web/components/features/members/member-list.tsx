import { UserPlus, UserX } from "lucide-react";

import type { Member, Role } from "@/lib/api";
import { hasRole } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MemberListProps {
  members: Member[];
  currentRole?: Role;
  onRemove?: (memberId: string) => void;
}

export function MemberList({ members, currentRole, onRemove }: MemberListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Members</CardTitle>
        {hasRole(currentRole, "Owner") ? (
          <Button size="sm" variant="outline" className="gap-2" type="button">
            <UserPlus className="h-4 w-4" /> Invite
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between rounded-xl border border-border p-3">
            <div>
              <p className="font-semibold">{member.email}</p>
              <Badge variant="secondary" className="mt-1">
                {member.role}
              </Badge>
            </div>
            {hasRole(currentRole, "Owner") && member.role !== "Owner" && onRemove ? (
              <Button variant="ghost" size="icon" onClick={() => onRemove(member.id)}>
                <UserX className="h-5 w-5" />
              </Button>
            ) : null}
          </div>
        ))}
        {!members.length ? <p className="text-sm text-muted-foreground">No members yet.</p> : null}
      </CardContent>
    </Card>
  );
}
