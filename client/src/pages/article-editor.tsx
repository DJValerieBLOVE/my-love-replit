import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "@/components/image-upload";
import { useNostr } from "@/contexts/nostr-context";
import { useNDK } from "@/contexts/ndk-context";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";
import {
  ArrowLeft,
  FileText,
  Loader2,
  Save,
  Send,
} from "lucide-react";
import { htmlToMarkdown } from "@/lib/html-to-markdown";
import {
  useRichTextEditor,
  RichTextEditorContent,
  EditorPreview,
  EditorModeToggle,
  richTextEditorStyles,
} from "@/components/rich-text-editor";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 80);
}

export default function ArticleEditor() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id?: string }>();
  const { isConnected, profile, signEvent } = useNostr();
  const { ndk, publishSmart } = useNDK();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState("");
  const [showMetadata, setShowMetadata] = useState(true);
  const [useHeroImage, setUseHeroImage] = useState(true);
  const [previewMode, setPreviewMode] = useState<"editor" | "preview">("editor");
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [existingIdentifier, setExistingIdentifier] = useState("");

  const editor = useRichTextEditor({ placeholder: "Start writing your article..." });

  useEffect(() => {
    if (params.id && ndk) {
      loadExistingArticle(params.id);
    }
  }, [params.id, ndk]);

  const loadExistingArticle = async (naddrStr: string) => {
    try {
      if (!naddrStr.startsWith("naddr1")) return;
      const decoded = nip19.decode(naddrStr);
      if (decoded.type !== "naddr") return;
      const { pubkey, identifier, kind } = decoded.data;

      if (!ndk) return;
      const events = await ndk.fetchEvents({
        kinds: [kind],
        authors: [pubkey],
        "#d": [identifier],
      });

      const event = Array.from(events)[0];
      if (!event) return;

      const titleTag = event.tags.find((t) => t[0] === "title");
      const summaryTag = event.tags.find((t) => t[0] === "summary");
      const imageTag = event.tags.find((t) => t[0] === "image");
      const dTag = event.tags.find((t) => t[0] === "d");
      const tTags = event.tags.filter((t) => t[0] === "t").map((t) => t[1]);

      setTitle(titleTag?.[1] || "");
      setSummary(summaryTag?.[1] || "");
      setHeroImage(imageTag?.[1] || "");
      setTags(tTags.join(", "));
      setExistingIdentifier(dTag?.[1] || "");

      if (editor && event.content) {
        editor.commands.setContent(event.content);
      }
    } catch (err) {
      console.error("Failed to load article:", err);
    }
  };

  const getArticleContent = (): string => {
    if (!editor) return "";
    return htmlToMarkdown(editor.getHTML());
  };

  const buildArticleTags = (isPublish: boolean): string[][] => {
    const identifier = existingIdentifier || generateSlug(title);
    const articleTags: string[][] = [
      ["d", identifier],
      ["title", title],
      ["summary", summary],
      ["client", "My Masterpiece"],
    ];

    if (isPublish) {
      articleTags.push(["published_at", Math.floor(Date.now() / 1000).toString()]);
    }

    if (useHeroImage && heroImage) {
      articleTags.push(["image", heroImage]);
    }

    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    tagList.forEach((t) => articleTags.push(["t", t]));

    return articleTags;
  };

  const handlePublish = async () => {
    if (!isConnected || !ndk || !profile) {
      toast({
        title: "Not Connected",
        description: "Please connect your Nostr account to publish articles.",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter an article title before publishing.",
        variant: "destructive",
      });
      return;
    }

    const content = getArticleContent();
    if (!content.trim()) {
      toast({
        title: "Content Required",
        description: "Please write some content before publishing.",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);
    try {
      const event = new NDKEvent(ndk);
      event.kind = 30023;
      event.content = content;
      event.tags = buildArticleTags(true);

      await publishSmart(event, true);

      toast({
        title: "Article Published",
        description: "Your article has been published to Nostr.",
      });

      setLocation("/articles");
    } catch (err) {
      console.error("Failed to publish article:", err);
      toast({
        title: "Publish Failed",
        description: "Failed to publish article. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!isConnected || !ndk || !profile) {
      toast({
        title: "Not Connected",
        description: "Please connect your Nostr account to save drafts.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingDraft(true);
    try {
      const event = new NDKEvent(ndk);
      event.kind = 30024;
      event.content = getArticleContent();
      event.tags = buildArticleTags(false);

      await publishSmart(event, false);

      setLastSavedAt(new Date());
      toast({
        title: "Draft Saved",
        description: "Your article draft has been saved privately.",
      });
    } catch (err) {
      console.error("Failed to save draft:", err);
      toast({
        title: "Save Failed",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingDraft(false);
    }
  };

  const canSave = title.trim().length > 0;

  return (
    <Layout>
      <div className="max-w-[1200px] mx-auto px-4 py-6" data-testid="article-editor-page">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/articles")}
            data-testid="button-back-articles"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </Button>
          <h1 className="text-2xl font-serif" data-testid="text-editor-title">
            {params.id ? "Edit Article" : "Write Article"}
          </h1>
        </div>

        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            <div className="space-y-4">
              {showMetadata && (
                <div className="space-y-4" id="editor_metadata">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Title"
                    className="w-full text-4xl font-serif bg-transparent border-none outline-none placeholder:text-gray-300"
                    data-testid="input-article-title"
                  />

                  {useHeroImage && (
                    <div className="w-full">
                      {heroImage ? (
                        <div className="relative group">
                          <div className="aspect-video rounded-lg overflow-hidden border border-gray-200">
                            <img
                              src={heroImage}
                              alt="Hero"
                              className="w-full h-full object-cover"
                              data-testid="img-hero-image"
                            />
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center rounded-lg">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-white text-foreground border-white"
                                onClick={() => {
                                  const url = window.prompt("Enter new image URL:", heroImage);
                                  if (url !== null) setHeroImage(url);
                                }}
                                data-testid="button-change-hero"
                              >
                                Change
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-white text-destructive border-white"
                                onClick={() => setHeroImage("")}
                                data-testid="button-remove-hero"
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <ImageUpload
                          value={heroImage}
                          onChange={setHeroImage}
                          aspectRatio="video"
                        />
                      )}
                    </div>
                  )}

                  <div className="border-l-2 border-gray-300 pl-4">
                    <input
                      type="text"
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="Article Summary"
                      className="w-full text-base font-serif bg-transparent border-none outline-none placeholder:text-gray-400"
                      data-testid="input-article-summary"
                    />
                  </div>

                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Enter tags (separated by commas)"
                    className="w-full text-sm font-serif bg-transparent border-none outline-none placeholder:text-gray-400"
                    data-testid="input-article-tags"
                  />
                </div>
              )}

              {previewMode === "editor" && editor && (
                <RichTextEditorContent editor={editor} />
              )}

              {previewMode === "preview" && (
                <div className="bg-white rounded-lg p-6" data-testid="article-preview">
                  <h1 className="text-4xl font-serif mb-4" data-testid="text-preview-title">
                    {title || "Untitled Article"}
                  </h1>
                  {useHeroImage && heroImage && (
                    <div className="aspect-video rounded-lg overflow-hidden mb-6">
                      <img
                        src={heroImage}
                        alt="Hero"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {summary && (
                    <p className="text-muted-foreground text-lg mb-6 font-serif italic">
                      {summary}
                    </p>
                  )}
                  <EditorPreview html={editor?.getHTML() || ""} />
                  {tags && (
                    <div className="flex flex-wrap gap-2 mt-8 pt-4 border-t border-gray-200">
                      {tags
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean)
                        .map((tag) => (
                          <span
                            key={tag}
                            className="bg-white border border-gray-200 text-muted-foreground text-xs px-2.5 py-0.5 rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="w-[260px] flex-shrink-0 hidden lg:block">
            <div className="sticky top-[80px] space-y-6">
              <div className="space-y-3">
                <h3 className="text-sm font-serif text-foreground">Options</h3>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="show-metadata"
                    checked={showMetadata}
                    onCheckedChange={(checked) => setShowMetadata(checked as boolean)}
                    data-testid="checkbox-show-metadata"
                  />
                  <Label htmlFor="show-metadata" className="text-sm font-serif cursor-pointer">
                    Show article metadata
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="use-hero"
                    checked={useHeroImage}
                    onCheckedChange={(checked) => setUseHeroImage(checked as boolean)}
                    data-testid="checkbox-use-hero"
                  />
                  <Label htmlFor="use-hero" className="text-sm font-serif cursor-pointer">
                    Use hero image
                  </Label>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-serif text-foreground">Edit & Preview</h3>
                <EditorModeToggle mode={previewMode} onModeChange={setPreviewMode} />
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-serif text-foreground">Save & Publish</h3>
                {!canSave && (
                  <p className="text-xs text-muted-foreground font-serif">
                    Enter article title before you can save
                  </p>
                )}
                <Button
                  variant="outline"
                  className="w-full rounded-full font-serif"
                  disabled={!canSave || isSavingDraft}
                  onClick={handleSaveDraft}
                  data-testid="button-save-draft"
                >
                  {isSavingDraft ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                  )}
                  Save Draft Privately
                </Button>
                <Button
                  className="w-full rounded-full bg-[#6600ff] hover:bg-[#5500dd] text-white font-serif"
                  disabled={!canSave || isPublishing}
                  onClick={handlePublish}
                  data-testid="button-publish-article"
                >
                  {isPublishing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  )}
                  Continue to Publish Article
                </Button>
                {lastSavedAt && (
                  <p className="text-xs text-muted-foreground font-serif text-center">
                    Last saved: {lastSavedAt.toLocaleTimeString()}
                  </p>
                )}
              </div>

              <Button
                variant="outline"
                className="w-full rounded-full font-serif"
                onClick={() => setLocation("/articles")}
                data-testid="button-my-articles"
              >
                <FileText className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                My Articles
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style>{richTextEditorStyles}</style>
    </Layout>
  );
}
