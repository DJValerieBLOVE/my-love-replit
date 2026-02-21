import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "@/components/image-upload";
import { useNostr } from "@/contexts/nostr-context";
import { useNDK } from "@/contexts/ndk-context";
import { useToast } from "@/hooks/use-toast";
import { useState, useCallback, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";
import {
  ArrowLeft,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Image as ImageIcon,
  Link as LinkIcon,
  Code,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Table,
  Minus,
  Undo,
  Redo,
  FileText,
  Loader2,
  Eye,
  Pencil,
  Save,
  Send,
} from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import TiptapLink from "@tiptap/extension-link";
import TiptapUnderline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { Table as TableExtension } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { htmlToMarkdown } from "@/lib/html-to-markdown";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 80);
}

function editorContentToMarkdown(editor: any): string {
  if (!editor) return "";
  return editor.getHTML();
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

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      TiptapImage.configure({
        inline: false,
        allowBase64: false,
      }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[#6600ff] underline cursor-pointer",
        },
      }),
      TiptapUnderline,
      Placeholder.configure({
        placeholder: "Start writing your article...",
      }),
      TableExtension.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none min-h-[400px] font-serif",
      },
    },
  });

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

  const addImage = useCallback(() => {
    const url = window.prompt("Enter image URL:");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const insertTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

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
                <>
                  <div
                    className="sticky top-[64px] z-10 bg-white border-b border-gray-200 py-2 flex flex-wrap items-center gap-0.5"
                    id="editor_toolbar"
                    data-testid="editor-toolbar"
                  >
                    <ToolbarSelect editor={editor} />
                    <div className="w-px h-6 bg-gray-200 mx-1" />

                    <ToolbarButton
                      icon={Bold}
                      active={editor.isActive("bold")}
                      onClick={() => editor.chain().focus().toggleBold().run()}
                      tooltip="Bold"
                    />
                    <ToolbarButton
                      icon={Italic}
                      active={editor.isActive("italic")}
                      onClick={() => editor.chain().focus().toggleItalic().run()}
                      tooltip="Italic"
                    />
                    <ToolbarButton
                      icon={UnderlineIcon}
                      active={editor.isActive("underline")}
                      onClick={() => editor.chain().focus().toggleUnderline().run()}
                      tooltip="Underline"
                    />
                    <ToolbarButton
                      icon={Strikethrough}
                      active={editor.isActive("strike")}
                      onClick={() => editor.chain().focus().toggleStrike().run()}
                      tooltip="Strikethrough"
                    />

                    <div className="w-px h-6 bg-gray-200 mx-1" />

                    <ToolbarButton
                      icon={List}
                      active={editor.isActive("bulletList")}
                      onClick={() => editor.chain().focus().toggleBulletList().run()}
                      tooltip="Bullet List"
                    />
                    <ToolbarButton
                      icon={ListOrdered}
                      active={editor.isActive("orderedList")}
                      onClick={() => editor.chain().focus().toggleOrderedList().run()}
                      tooltip="Ordered List"
                    />

                    <div className="w-px h-6 bg-gray-200 mx-1" />

                    <ToolbarButton
                      icon={Table}
                      active={false}
                      onClick={insertTable}
                      tooltip="Insert Table"
                    />
                    <ToolbarButton
                      icon={ImageIcon}
                      active={false}
                      onClick={addImage}
                      tooltip="Insert Image"
                    />
                    <ToolbarButton
                      icon={Quote}
                      active={editor.isActive("blockquote")}
                      onClick={() => editor.chain().focus().toggleBlockquote().run()}
                      tooltip="Quote"
                    />
                    <ToolbarButton
                      icon={LinkIcon}
                      active={editor.isActive("link")}
                      onClick={addLink}
                      tooltip="Link"
                    />
                    <ToolbarButton
                      icon={Code}
                      active={editor.isActive("codeBlock")}
                      onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                      tooltip="Code Block"
                    />
                    <ToolbarButton
                      icon={Minus}
                      active={false}
                      onClick={() => editor.chain().focus().setHorizontalRule().run()}
                      tooltip="Horizontal Rule"
                    />
                  </div>

                  <div className="min-h-[400px] bg-white">
                    <EditorContent
                      editor={editor}
                      className="article-editor-content"
                      data-testid="editor-content"
                    />
                  </div>
                </>
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
                  <div
                    className="prose prose-sm sm:prose lg:prose-lg max-w-none font-serif"
                    dangerouslySetInnerHTML={{
                      __html: editor?.getHTML() || "",
                    }}
                  />
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
                <div className="flex rounded-full border border-gray-200 overflow-hidden">
                  <button
                    className={`flex-1 py-2 px-4 text-sm font-serif transition-colors ${
                      previewMode === "editor"
                        ? "bg-foreground text-background"
                        : "bg-white text-foreground hover:bg-[#F5F5F5]"
                    }`}
                    onClick={() => setPreviewMode("editor")}
                    data-testid="button-edit-mode"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                      Edit Mode
                    </div>
                  </button>
                  <button
                    className={`flex-1 py-2 px-4 text-sm font-serif transition-colors ${
                      previewMode === "preview"
                        ? "bg-foreground text-background"
                        : "bg-white text-foreground hover:bg-[#F5F5F5]"
                    }`}
                    onClick={() => setPreviewMode("preview")}
                    data-testid="button-preview-mode"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                      Preview
                    </div>
                  </button>
                </div>
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

      <style>{`
        .article-editor-content .tiptap {
          outline: none;
          min-height: 400px;
          font-family: 'Marcellus', serif;
        }
        .article-editor-content .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        .article-editor-content .tiptap h1 {
          font-size: 2em;
          font-weight: 400;
          margin-top: 1em;
          margin-bottom: 0.5em;
          font-family: 'Marcellus', serif;
        }
        .article-editor-content .tiptap h2 {
          font-size: 1.5em;
          font-weight: 400;
          margin-top: 0.8em;
          margin-bottom: 0.4em;
          font-family: 'Marcellus', serif;
        }
        .article-editor-content .tiptap h3 {
          font-size: 1.25em;
          font-weight: 400;
          margin-top: 0.6em;
          margin-bottom: 0.3em;
          font-family: 'Marcellus', serif;
        }
        .article-editor-content .tiptap p {
          margin-bottom: 0.75em;
          line-height: 1.7;
        }
        .article-editor-content .tiptap blockquote {
          border-left: 3px solid #6600ff;
          padding-left: 1em;
          color: #666;
          margin: 1em 0;
          font-style: italic;
        }
        .article-editor-content .tiptap pre {
          background: #1e1e2e;
          color: #cdd6f4;
          padding: 1em;
          border-radius: 8px;
          overflow-x: auto;
          margin: 1em 0;
        }
        .article-editor-content .tiptap code {
          background: #f0f0f0;
          padding: 0.2em 0.4em;
          border-radius: 4px;
          font-size: 0.85em;
        }
        .article-editor-content .tiptap pre code {
          background: none;
          padding: 0;
          border-radius: 0;
          color: inherit;
        }
        .article-editor-content .tiptap img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1em 0;
        }
        .article-editor-content .tiptap ul,
        .article-editor-content .tiptap ol {
          padding-left: 1.5em;
          margin: 0.5em 0;
        }
        .article-editor-content .tiptap li {
          margin-bottom: 0.25em;
        }
        .article-editor-content .tiptap hr {
          border: none;
          border-top: 1px solid #e5e5e5;
          margin: 1.5em 0;
        }
        .article-editor-content .tiptap a {
          color: #6600ff;
          text-decoration: underline;
        }
        .article-editor-content .tiptap table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
        }
        .article-editor-content .tiptap table td,
        .article-editor-content .tiptap table th {
          border: 1px solid #e5e5e5;
          padding: 0.5em 0.75em;
          text-align: left;
        }
        .article-editor-content .tiptap table th {
          background: #f5f5f5;
          font-weight: 400;
        }
      `}</style>
    </Layout>
  );
}

function ToolbarButton({
  icon: Icon,
  active,
  onClick,
  tooltip,
}: {
  icon: any;
  active: boolean;
  onClick: () => void;
  tooltip: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={tooltip}
      className={`p-1.5 rounded transition-colors ${
        active
          ? "bg-[#F0E6FF] text-[#6600ff]"
          : "text-muted-foreground hover:bg-[#F5F5F5] hover:text-foreground"
      }`}
      data-testid={`toolbar-${tooltip.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <Icon className="w-4 h-4" strokeWidth={1.5} />
    </button>
  );
}

function ToolbarSelect({ editor }: { editor: any }) {
  const [open, setOpen] = useState(false);

  const getCurrentBlock = () => {
    if (editor.isActive("heading", { level: 1 })) return "Heading 1";
    if (editor.isActive("heading", { level: 2 })) return "Heading 2";
    if (editor.isActive("heading", { level: 3 })) return "Heading 3";
    if (editor.isActive("codeBlock")) return "Code Block";
    if (editor.isActive("blockquote")) return "Quote";
    return "Normal text";
  };

  const setBlock = (type: string) => {
    switch (type) {
      case "paragraph":
        editor.chain().focus().setParagraph().run();
        break;
      case "h1":
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case "h2":
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case "h3":
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        break;
      case "code":
        editor.chain().focus().toggleCodeBlock().run();
        break;
      case "quote":
        editor.chain().focus().toggleBlockquote().run();
        break;
    }
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1.5 text-sm font-serif text-foreground hover:bg-[#F5F5F5] rounded transition-colors min-w-[120px]"
        data-testid="toolbar-block-selector"
      >
        {getCurrentBlock()}
        <svg className="w-3 h-3 ml-auto" viewBox="0 0 12 12" fill="none">
          <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-30 min-w-[160px]">
            {[
              { id: "paragraph", label: "Normal text" },
              { id: "h1", label: "Heading 1" },
              { id: "h2", label: "Heading 2" },
              { id: "h3", label: "Heading 3" },
              { id: "code", label: "Code Block" },
              { id: "quote", label: "Quote" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setBlock(item.id)}
                className="w-full text-left px-3 py-1.5 text-sm font-serif hover:bg-[#F5F5F5] transition-colors"
                data-testid={`block-${item.id}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
