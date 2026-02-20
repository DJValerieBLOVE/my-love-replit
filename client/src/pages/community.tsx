import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, Plus, Lock, Check } from "lucide-react";
import CommunityCover from "@assets/generated_images/community_cover.png";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getAllCommunities, getMyCommunities } from "@/lib/api";
import { useNostr } from "@/contexts/nostr-context";

export default function Community() {
  const { isConnected } = useNostr();

  const { data: communities = [], isLoading } = useQuery({
    queryKey: ["communities"],
    queryFn: getAllCommunities,
  });

  const { data: myCommunities = [] } = useQuery({
    queryKey: ["myCommunities"],
    queryFn: getMyCommunities,
    enabled: isConnected,
  });

  const myMembershipIds = new Set(myCommunities.map((m: any) => m.communityId || m.id));

  const getAccessBadge = (accessType: string) => {
    switch (accessType) {
      case "approval":
        return <Badge variant="secondary" className="text-xs"><Lock className="w-3 h-3 mr-1" />Approval</Badge>;
      case "paid":
        return <Badge variant="secondary" className="text-xs text-yellow-600">Paid</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Public</Badge>;
    }
  };

  return (
    <Layout>
      <div className="relative h-48 md:h-64 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 pt-[0px] pb-[0px]" />
        <img 
          src={CommunityCover} 
          alt="Community" 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-serif font-normal text-muted-foreground">Communities</h1>
            <p className="text-muted-foreground max-w-md">Intimate spaces to connect and grow together.</p>
          </div>
          {isConnected && (
            <Link href="/community/create">
              <Button className="gap-2" data-testid="button-create-community">
                <Plus className="w-4 h-4" />
                Create Community
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 lg:p-8">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading communities...</p>
          </div>
        ) : communities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No communities yet.</p>
            {isConnected && (
              <Link href="/community/create">
                <Button>Create the first community</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {communities.map((community: any) => {
              const isMember = myMembershipIds.has(community.id);
              return (
                <Link key={community.id} href={`/community/${community.id}`}>
                  <Card className="hover:shadow-md transition-all border-none bg-card/50 shadow-sm group cursor-pointer overflow-hidden flex flex-col h-full" data-testid={`card-community-${community.id}`}>
                    <div className="h-[2px] w-full bg-gradient-to-r from-primary/20 to-primary/5 group-hover:from-primary group-hover:to-purple-400 transition-all" />
                    {community.coverImage && (
                      <div className="h-24 overflow-hidden">
                        <img src={community.coverImage} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <CardHeader className="pb-2 pt-4 relative z-10">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-xl font-normal text-muted-foreground group-hover:text-primary transition-colors font-serif">
                          {community.name}
                        </CardTitle>
                        {getAccessBadge(community.accessType)}
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1">
                      <p className="text-base text-muted-foreground mb-4 line-clamp-2">
                        {community.description}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                        <Users className="w-3 h-3" />
                        <span>{community.memberCount || 0} members</span>
                      </div>
                      <div className="flex-1 flex items-end justify-center">
                        {isMember ? (
                          <Button variant="outline" className="px-6 transition-all gap-2" data-testid="button-joined">
                            <Check className="w-4 h-4" /> Joined
                          </Button>
                        ) : (
                          <Button className="px-6 transition-all" data-testid="button-join-community">
                            Join <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
