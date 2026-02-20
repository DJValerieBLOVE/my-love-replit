import Layout from "@/components/layout";
import { ShoppingBag, Briefcase, Wrench, MoreHorizontal, Plus, Search, Loader2, Heart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getLoveBoardPosts } from "@/lib/api";
import { useLocation } from "wouter";
import { MembershipGate } from "@/components/membership-gate";

const LOVE_BOARD_TABS = [
  { id: "all", label: "All", icon: null },
  { id: "for_sale", label: "For Sale", icon: ShoppingBag },
  { id: "help_wanted", label: "Help Wanted", icon: Briefcase },
  { id: "services", label: "Services", icon: Wrench },
  { id: "other", label: "Other", icon: MoreHorizontal },
];

const CATEGORY_LABELS: Record<string, string> = {
  for_sale: "For Sale",
  help_wanted: "Help Wanted",
  services: "Services",
  other: "Other",
};

const CATEGORY_COLORS: Record<string, string> = {
  for_sale: "text-muted-foreground",
  help_wanted: "text-muted-foreground",
  services: "text-muted-foreground",
  other: "text-muted-foreground",
};

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["loveBoardPosts", activeTab],
    queryFn: () => getLoveBoardPosts(activeTab),
  });

  const filteredPosts = searchQuery.trim()
    ? posts.filter((p: any) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : posts;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-normal text-muted-foreground mb-2" data-testid="text-page-title">Love Board</h1>
          <p className="text-muted-foreground">A marketplace for the community — share, trade, and support each other.</p>
        </div>

        {/* Tabs & Actions */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
          <div className="flex gap-1.5 flex-wrap items-center">
            {LOVE_BOARD_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-full text-sm transition-colors border flex items-center gap-1.5 ${activeTab === tab.id ? "bg-foreground text-background border-foreground" : "bg-white text-muted-foreground border-gray-200 hover:border-gray-400"}`}
                data-testid={`tab-${tab.id}`}
              >
                {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
                {tab.label}
              </button>
            ))}
            <MembershipGate feature="loveBoard">
              <Button className="gap-2 ml-2" onClick={() => setLocation("/leaderboard/create")} data-testid="button-create-listing">
                <Plus className="w-4 h-4" /> Create Listing
              </Button>
            </MembershipGate>
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white"
              data-testid="input-search"
            />
          </div>
        </div>

        <div>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPosts.map((post: any) => (
                  <Card key={post.id} className="border-none shadow-sm hover:shadow-md transition-all group bg-card cursor-pointer rounded-xs overflow-hidden" data-testid={`card-listing-${post.id}`}>
                    <div className="h-[2px] w-full bg-primary" />
                    {post.image && (
                      <div className="aspect-video overflow-hidden bg-muted">
                        <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2.5 py-0.5 rounded-md border border-gray-200 bg-white ${CATEGORY_COLORS[post.category] || "text-muted-foreground"}`} data-testid={`badge-category-${post.id}`}>
                          {CATEGORY_LABELS[post.category] || post.category}
                        </span>
                        {post.price && (
                          <span className="text-xs text-muted-foreground">{post.price}</span>
                        )}
                      </div>
                      <h3 className="font-normal text-lg text-muted-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1" data-testid={`text-listing-title-${post.id}`}>
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {post.description}
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={post.author?.avatar} />
                            <AvatarFallback>{(post.author?.name || "?").charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground" data-testid={`text-author-${post.id}`}>{post.author?.name}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {post.likes}</span>
                          <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {post.zaps}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-2 p-8 text-center bg-[#F5F5F5]">
                <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-2">No listings yet</p>
                <p className="text-sm text-muted-foreground mb-4">Be the first to post something for the community!</p>
                <MembershipGate feature="loveBoard">
                  <Button onClick={() => setLocation("/leaderboard/create")} className="gap-2" data-testid="button-create-first-listing">
                    <Plus className="w-4 h-4" /> Create Listing
                  </Button>
                </MembershipGate>
              </Card>
            )}
        </div>
      </div>
    </Layout>
  );
}
