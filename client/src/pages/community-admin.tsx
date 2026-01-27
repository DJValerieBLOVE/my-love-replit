import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Users, 
  UserPlus, 
  Check, 
  X, 
  Shield, 
  Crown,
  Search,
  MoreHorizontal,
  Loader2
} from "lucide-react";
import { Link, useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCommunity, getCommunityMembers, getCommunityMembership, getPendingJoinRequests, approveJoinRequest, rejectJoinRequest, updateMemberRole, removeCommunityMember } from "@/lib/api";
import { useNostr } from "@/contexts/nostr-context";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CommunityAdmin() {
  const [, params] = useRoute("/community/:id/admin");
  const [, setLocation] = useLocation();
  const communityId = params?.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile } = useNostr();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: community, isLoading: loadingCommunity } = useQuery({
    queryKey: ["community", communityId],
    queryFn: () => getCommunity(communityId!),
    enabled: !!communityId,
  });

  const { data: members = [] } = useQuery({
    queryKey: ["communityMembers", communityId],
    queryFn: () => getCommunityMembers(communityId!),
    enabled: !!communityId,
  });

  const { data: pendingRequests = [] } = useQuery({
    queryKey: ["pendingJoinRequests", communityId],
    queryFn: () => getPendingJoinRequests(communityId!),
    enabled: !!communityId,
  });

  const approveMutation = useMutation({
    mutationFn: (membershipId: string) => approveJoinRequest(membershipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingJoinRequests", communityId] });
      queryClient.invalidateQueries({ queryKey: ["communityMembers", communityId] });
      queryClient.invalidateQueries({ queryKey: ["community", communityId] });
      toast({ title: "Approved", description: "Member has been approved." });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (membershipId: string) => rejectJoinRequest(membershipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingJoinRequests", communityId] });
      toast({ title: "Rejected", description: "Request has been rejected." });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ membershipId, role }: { membershipId: string; role: string }) => updateMemberRole(membershipId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityMembers", communityId] });
      toast({ title: "Updated", description: "Member role has been updated." });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (membershipId: string) => removeCommunityMember(membershipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityMembers", communityId] });
      queryClient.invalidateQueries({ queryKey: ["community", communityId] });
      toast({ title: "Removed", description: "Member has been removed." });
    },
  });

  const { data: membership } = useQuery({
    queryKey: ["communityMembership", communityId],
    queryFn: () => getCommunityMembership(communityId!),
    enabled: !!communityId && !!profile,
  });

  const isAdmin = membership?.role === "admin" || (membership?.userId && membership.userId === community?.creatorId);

  if (loadingCommunity) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!community || !isAdmin) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You don't have admin access to this community.</p>
          <Link href="/community">
            <Button>Back to Communities</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const filteredMembers = members.filter((m: any) => 
    m.user?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.user?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-primary text-white gap-1"><Crown className="w-3 h-3" />Admin</Badge>;
      case "moderator":
        return <Badge variant="secondary" className="gap-1"><Shield className="w-3 h-3" />Mod</Badge>;
      default:
        return <Badge variant="outline">Member</Badge>;
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/community/${communityId}`}>
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Community
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-muted-foreground">{community.name}</h1>
            <p className="text-sm text-muted-foreground">Admin Dashboard</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-primary">{community.memberCount || 0}</div>
              <div className="text-sm text-muted-foreground">Members</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-yellow-500">{pendingRequests.length}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-500">{members.filter((m: any) => m.role === "admin" || m.role === "moderator").length}</div>
              <div className="text-sm text-muted-foreground">Staff</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="members" className="gap-2">
              <Users className="w-4 h-4" />
              Members ({members.length})
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-2">
              <UserPlus className="w-4 h-4" />
              Requests ({pendingRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">All Members</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search members..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                      data-testid="input-search-members"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredMembers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No members found.</p>
                ) : (
                  <div className="space-y-3">
                    {filteredMembers.map((member: any) => (
                      <div key={member.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50" data-testid={`member-${member.id}`}>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={member.user?.avatar} />
                            <AvatarFallback>{member.user?.displayName?.[0] || "?"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.user?.displayName || member.user?.username || "Unknown"}</div>
                            <div className="text-sm text-muted-foreground">
                              Joined {new Date(member.joinedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getRoleBadge(member.role)}
                          {member.userId !== community.createdBy && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {member.role !== "moderator" && (
                                  <DropdownMenuItem onClick={() => updateRoleMutation.mutate({ membershipId: member.id, role: "moderator" })}>
                                    <Shield className="w-4 h-4 mr-2" />
                                    Make Moderator
                                  </DropdownMenuItem>
                                )}
                                {member.role === "moderator" && (
                                  <DropdownMenuItem onClick={() => updateRoleMutation.mutate({ membershipId: member.id, role: "member" })}>
                                    Remove Moderator
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => removeMemberMutation.mutate(member.id)}
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Remove Member
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Join Requests</CardTitle>
                <CardDescription>Review and approve membership requests</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingRequests.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No pending requests.</p>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map((request: any) => (
                      <div key={request.id} className="p-4 border rounded-lg space-y-3" data-testid={`request-${request.id}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={request.user?.avatar} />
                              <AvatarFallback>{request.user?.displayName?.[0] || "?"}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{request.user?.displayName || request.user?.username || "Unknown"}</div>
                              <div className="text-sm text-muted-foreground">
                                Requested {new Date(request.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => rejectMutation.mutate(request.id)}
                              disabled={rejectMutation.isPending}
                              data-testid="button-reject"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => approveMutation.mutate(request.id)}
                              disabled={approveMutation.isPending}
                              data-testid="button-approve"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                          </div>
                        </div>
                        {request.approvalAnswers && request.approvalAnswers.length > 0 && (
                          <div className="bg-muted p-3 rounded-lg space-y-2">
                            {request.approvalAnswers.map((answer: string, i: number) => (
                              <div key={i} className="text-sm">
                                <span className="font-medium">Q{i + 1}:</span> {answer}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
