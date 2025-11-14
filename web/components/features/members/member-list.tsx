import { UserX, Shield, Edit, Users, Eye, MoreVertical, UserCheck } from "lucide-react";
import { useState } from "react";

import type { Member, Role } from "@/lib/api";
import { hasRole } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MemberListProps {
  members: Member[];
  currentRole?: Role;
  onRemove?: (memberId: string) => void;
}

const roleIcons = {
  owner: Shield,
  manager: Edit,
  contributor: Users,
  viewer: Eye
};

const roleColors = {
  owner: "bg-purple-100 text-purple-800 border-purple-200",
  manager: "bg-blue-100 text-blue-800 border-blue-200",
  contributor: "bg-green-100 text-green-800 border-green-200",
  viewer: "bg-gray-100 text-gray-800 border-gray-200"
};

const roleDescriptions = {
  owner: "Full access to all budget features",
  manager: "Can manage categories and entries",
  contributor: "Can add and edit entries",
  viewer: "Can only view budget data"
};

export function MemberList({ members, currentRole, onRemove }: MemberListProps) {
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

  const handleRemoveClick = (memberId: string) => {
    setMemberToRemove(memberId);
  };

  const handleConfirmRemove = () => {
    if (memberToRemove && onRemove) {
      onRemove(memberToRemove);
      setMemberToRemove(null);
    }
  };

  if (!members.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <UserCheck className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">No team members yet</p>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Invite team members to collaborate on this budget
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
            <Badge variant="outline" className="ml-auto">
              {members.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {members.map((member) => {
            const Icon = roleIcons[member.role];
            const colorClass = roleColors[member.role];
            const description = roleDescriptions[member.role];
            const canRemove = hasRole(currentRole, "owner") && member.role !== "owner";

            return (
              <div
                key={member.user_id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {member.user_name || member.user_email.split('@')[0]}
                      </p>
                      <Badge variant="outline" className={colorClass}>
                        {member.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {member.user_email}
                    </p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                </div>

                {canRemove && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleRemoveClick(member.user_id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        Remove member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Dialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove team member?</DialogTitle>
            <DialogDescription>
              This member will lose access to this budget and all its data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMemberToRemove(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmRemove}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
