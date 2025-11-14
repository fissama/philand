"use client";

import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTranslations } from 'next-intl';
import { UserPlus, Loader2, Users, Shield, Eye, Edit } from "lucide-react";

import { MemberList } from "@/components/features/members/member-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { useBudgetRole } from "@/lib/useBudgetRole";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["owner", "manager", "contributor", "viewer"])
});

type FormValues = z.infer<typeof schema>;

const roleIcons = {
  owner: Shield,
  manager: Edit,
  contributor: Users,
  viewer: Eye
};

const roleColors = {
  owner: "text-purple-600 bg-purple-100 border-purple-200",
  manager: "text-blue-600 bg-blue-100 border-blue-200",
  contributor: "text-green-600 bg-green-100 border-green-200",
  viewer: "text-gray-600 bg-gray-100 border-gray-200"
};

export default function BudgetMembersPage() {
  const t = useTranslations();
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { role: currentRole, isOwner } = useBudgetRole(params.id);

  const membersQuery = useQuery({ 
    queryKey: ["members", params.id], 
    queryFn: () => api.members.list(params.id) 
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", role: "viewer" }
  });

  const createMutation = useMutation({
    mutationFn: (values: FormValues) => api.members.create(params.id, values),
    onSuccess: () => {
      toast.success(t('members.memberInvited'));
      queryClient.invalidateQueries({ queryKey: ["members", params.id] });
      form.reset({ email: "", role: "viewer" });
    },
    onError: (error: unknown) => {
      toast.error(t('members.failedToInvite'), { 
        description: error instanceof Error ? error.message : t('common.error') 
      });
    }
  });

  const removeMutation = useMutation({
    mutationFn: (memberId: string) => api.members.remove(params.id, memberId),
    onSuccess: () => {
      toast.success(t('members.memberRemoved'));
      queryClient.invalidateQueries({ queryKey: ["members", params.id] });
    },
    onError: (error: unknown) => {
      toast.error(t('members.failedToRemove'), { 
        description: error instanceof Error ? error.message : t('common.error') 
      });
    }
  });

  const membersByRole = membersQuery.data?.reduce((acc, member) => {
    acc[member.role] = (acc[member.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6" />
            {t('members.teamMembers')}
          </h2>
          <p className="text-muted-foreground">
            {t('members.manageTeamAccess')}
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{membersQuery.data?.length || 0} {t('members.totalMembers')}</span>
          </div>
        </div>
      </div>

      {/* Role distribution cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(roleColors).map(([role, colorClass]) => {
          const Icon = roleIcons[role as keyof typeof roleIcons];
          const count = membersByRole[role] || 0;
          return (
            <Card key={role} className="text-center">
              <CardContent className="pt-4">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-muted-foreground capitalize">
                  {t(`members.${role}`)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Members List */}
        <div>
          {membersQuery.isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t('members.loadingMembers')}</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <MemberList 
              members={membersQuery.data ?? []} 
              currentRole={currentRole} 
              onRemove={(id) => removeMutation.mutate(id)} 
            />
          )}
        </div>

        {/* Invite Member Form */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              {t('members.inviteMember')}
            </CardTitle>
            <CardDescription>
              {t('members.addNewTeamMember')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isOwner ? (
              <Form {...form}>
                <form className="space-y-4" onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('members.email')}</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="teammate@company.com" 
                            {...field}
                            className="transition-all focus:ring-2 focus:ring-primary/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('members.role')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('members.selectRole')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="owner">
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-purple-600" />
                                <div>
                                  <div className="font-medium">{t('members.owner')}</div>
                                  <div className="text-xs text-muted-foreground">{t('members.ownerDesc')}</div>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="manager">
                              <div className="flex items-center gap-2">
                                <Edit className="h-4 w-4 text-blue-600" />
                                <div>
                                  <div className="font-medium">{t('members.manager')}</div>
                                  <div className="text-xs text-muted-foreground">{t('members.managerDesc')}</div>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="contributor">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-green-600" />
                                <div>
                                  <div className="font-medium">{t('members.contributor')}</div>
                                  <div className="text-xs text-muted-foreground">{t('members.contributorDesc')}</div>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="viewer">
                              <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4 text-gray-600" />
                                <div>
                                  <div className="font-medium">{t('members.viewer')}</div>
                                  <div className="text-xs text-muted-foreground">{t('members.viewerDesc')}</div>
                                </div>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending}
                    className="w-full"
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('members.inviting')}
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        {t('members.sendInvite')}
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  {t('members.onlyOwners')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('members.contactOwnerToInvite')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
