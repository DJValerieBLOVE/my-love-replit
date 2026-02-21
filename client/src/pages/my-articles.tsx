import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNostr } from "@/contexts/nostr-context";
import { useNDK } from "@/contexts/ndk-context";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { nip19 } from "nostr-tools";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import {
  ArrowLeft,
  PenSquare,
  FileText,
  Clock,
  Send,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

type ArticleItem = {
  id: string;
  title: string;
  summary: string;
  image: string;
  publishedAt: number;
  identifier: string;
  naddr: string;
  kind: number;
  tags: string[];
};

export default function MyArticles() {
  const [, setLocation] = useLocation();
  const { isConnected, profile } = useNostr();
  const { ndk, fetchEvents } = useNDK();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"published" | "drafts">("published");
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [drafts, setDrafts] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected && profile?.pubkey) {
      loadArticles();
    }
  }, [isConnected, profile?.pubkey]);

  const loadArticles = async () => {
    if (!profile?.pubkey) return;
    setLoading(true);
    try {
      const publishedEvents = await fetchEvents({
        kinds: [30023 as any],
        authors: [profile.pubkey],
      });

      const parsedArticles: ArticleItem[] = publishedEvents.map((event) => {
        const titleTag = event.tags.find((t) => t[0] === "title");
        const summaryTag = event.tags.find((t) => t[0] === "summary");
        const imageTag = event.tags.find((t) => t[0] === "image");
        const dTag = event.tags.find((t) => t[0] === "d");
        const publishedAtTag = event.tags.find((t) => t[0] === "published_at");
        const tTags = event.tags.filter((t) => t[0] === "t").map((t) => t[1]);
        const identifier = dTag?.[1] || "";

        let naddr = "";
        try {
          naddr = nip19.naddrEncode({
            kind: 30023,
            pubkey: profile.pubkey,
            identifier,
          });
        } catch {}

        return {
          id: event.id || "",
          title: titleTag?.[1] || "Untitled",
          summary: summaryTag?.[1] || "",
          image: imageTag?.[1] || "",
          publishedAt: publishedAtTag
            ? parseInt(publishedAtTag[1])
            : event.created_at || 0,
          identifier,
          naddr,
          kind: 30023,
          tags: tTags,
        };
      });

      parsedArticles.sort((a, b) => b.publishedAt - a.publishedAt);
      setArticles(parsedArticles);

      const draftEvents = await fetchEvents({
        kinds: [30024 as any],
        authors: [profile.pubkey],
      });

      const parsedDrafts: ArticleItem[] = draftEvents.map((event) => {
        const titleTag = event.tags.find((t) => t[0] === "title");
        const summaryTag = event.tags.find((t) => t[0] === "summary");
        const imageTag = event.tags.find((t) => t[0] === "image");
        const dTag = event.tags.find((t) => t[0] === "d");
        const tTags = event.tags.filter((t) => t[0] === "t").map((t) => t[1]);
        const identifier = dTag?.[1] || "";

        let naddr = "";
        try {
          naddr = nip19.naddrEncode({
            kind: 30024,
            pubkey: profile.pubkey,
            identifier,
          });
        } catch {}

        return {
          id: event.id || "",
          title: titleTag?.[1] || "Untitled Draft",
          summary: summaryTag?.[1] || "",
          image: imageTag?.[1] || "",
          publishedAt: event.created_at || 0,
          identifier,
          naddr,
          kind: 30024,
          tags: tTags,
        };
      });

      parsedDrafts.sort((a, b) => b.publishedAt - a.publishedAt);
      setDrafts(parsedDrafts);
    } catch (err) {
      console.error("Failed to load articles:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (article: ArticleItem) => {
    if (!ndk || !profile?.pubkey) return;
    try {
      const event = new NDKEvent(ndk);
      event.kind = 5;
      event.tags = [["a", `${article.kind}:${profile.pubkey}:${article.identifier}`]];
      await event.publish();

      if (article.kind === 30023) {
        setArticles((prev) => prev.filter((a) => a.id !== article.id));
      } else {
        setDrafts((prev) => prev.filter((a) => a.id !== article.id));
      }

      toast({
        title: "Deleted",
        description: `${article.kind === 30024 ? "Draft" : "Article"} deleted.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const currentItems = activeTab === "published" ? articles : drafts;

  return (
    <Layout>
      <div className="max-w-[900px] mx-auto px-4 py-6" data-testid="my-articles-page">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/people")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
            </Button>
            <h1 className="text-2xl font-serif" data-testid="text-page-title">
              My Articles
            </h1>
          </div>
          <Button
            className="bg-foreground text-background hover:bg-foreground/90 rounded-full font-serif"
            onClick={() => setLocation("/articles/edit")}
            data-testid="button-write-article"
          >
            <PenSquare className="w-4 h-4 mr-2" strokeWidth={1.5} />
            Write Article
          </Button>
        </div>

        <div className="flex gap-2 mb-6">
          {(["published", "drafts"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-serif transition-colors ${
                activeTab === tab
                  ? "bg-foreground text-background"
                  : "bg-white border border-gray-200 text-foreground hover:bg-[#F5F5F5]"
              }`}
              data-testid={`tab-${tab}`}
            >
              {tab === "published" ? (
                <div className="flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Published ({articles.length})
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Drafts ({drafts.length})
                </div>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : currentItems.length === 0 ? (
          <div className="text-center py-20" data-testid="empty-state">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-muted-foreground font-serif text-lg mb-2">
              {activeTab === "published"
                ? "No published articles yet"
                : "No drafts saved"}
            </p>
            <p className="text-muted-foreground font-serif text-sm mb-6">
              {activeTab === "published"
                ? "Write and publish your first article to share with the world."
                : "Start writing and save your progress as a draft."}
            </p>
            <Button
              className="bg-foreground text-background hover:bg-foreground/90 rounded-full font-serif"
              onClick={() => setLocation("/articles/edit")}
              data-testid="button-start-writing"
            >
              <PenSquare className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Start Writing
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {currentItems.map((item) => (
              <Card
                key={item.id}
                className="border-none shadow-sm bg-card hover:shadow-md transition-shadow cursor-pointer"
                data-testid={`article-card-${item.id}`}
              >
                <div className="flex gap-4 p-4">
                  {item.image && (
                    <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className="flex-1 min-w-0"
                        onClick={() => {
                          if (item.naddr) {
                            setLocation(`/articles/edit/${item.naddr}`);
                          }
                        }}
                      >
                        <h3 className="font-serif text-base truncate" data-testid={`text-article-title-${item.id}`}>
                          {item.title}
                        </h3>
                        {item.summary && (
                          <p className="text-sm text-muted-foreground font-serif truncate mt-0.5">
                            {item.summary}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-muted-foreground font-serif flex items-center gap-1">
                            <Clock className="w-3 h-3" strokeWidth={1.5} />
                            {formatDate(item.publishedAt)}
                          </span>
                          {item.tags.length > 0 && (
                            <div className="flex gap-1">
                              {item.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="bg-white border border-gray-200 text-muted-foreground text-xs px-1.5 py-0 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="flex-shrink-0"
                            data-testid={`button-article-menu-${item.id}`}
                          >
                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              if (item.naddr) {
                                setLocation(`/articles/edit/${item.naddr}`);
                              }
                            }}
                          >
                            <Pencil className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(item)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" strokeWidth={1.5} />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
