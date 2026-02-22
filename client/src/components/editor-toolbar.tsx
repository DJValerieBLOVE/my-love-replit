import { useState, useCallback, useRef, useEffect } from "react";
import {
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
  Table,
  Minus,
  X,
} from "lucide-react";
import type { Editor } from "@tiptap/react";

interface ToolbarButtonProps {
  icon: any;
  active: boolean;
  onClick: () => void;
  tooltip: string;
}

export function ToolbarButton({ icon: Icon, active, onClick, tooltip }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={tooltip}
      className={`p-1.5 rounded transition-colors ${
        active
          ? "bg-[#F5F5F5] text-foreground"
          : "text-muted-foreground hover:bg-[#F5F5F5] hover:text-foreground"
      }`}
      data-testid={`toolbar-${tooltip.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <Icon className="w-4 h-4" strokeWidth={1.5} />
    </button>
  );
}

export function ToolbarSelect({ editor }: { editor: Editor }) {
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

interface EditorToolbarProps {
  editor: Editor;
  className?: string;
}

function LinkDialog({ open, onClose, onSubmit, initialUrl }: { open: boolean; onClose: () => void; onSubmit: (url: string) => void; initialUrl: string }) {
  const [url, setUrl] = useState(initialUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setUrl(initialUrl);
  }, [open, initialUrl]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/20" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-5 w-[400px] max-w-[90vw] pointer-events-auto" data-testid="link-dialog">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-serif font-normal text-foreground">Add Link</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-[#F5F5F5]">
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">URL</label>
              <input
                ref={inputRef}
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onSubmit(url); } }}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm font-serif focus:outline-none focus:border-gray-400 bg-white"
                autoFocus
                data-testid="input-link-url"
              />
            </div>
            <div className="flex justify-end gap-2">
              {initialUrl && (
                <button
                  onClick={() => onSubmit("")}
                  className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-[#F5F5F5] transition-colors"
                  data-testid="button-remove-link"
                >
                  Remove Link
                </button>
              )}
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-[#F5F5F5] transition-colors"
                data-testid="button-cancel-link"
              >
                Cancel
              </button>
              <button
                onClick={() => onSubmit(url)}
                disabled={!url.trim()}
                className="px-4 py-1.5 text-sm bg-foreground text-background rounded-md hover:opacity-90 transition-opacity disabled:opacity-40"
                data-testid="button-apply-link"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function EditorToolbar({ editor, className }: EditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkInitialUrl, setLinkInitialUrl] = useState("");

  const addImage = useCallback(async () => {
    fileInputRef.current?.click();
  }, []);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return;

    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      editor.chain().focus().setImage({ src: data.url }).run();
    } catch {
      console.error("Image upload failed");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [editor]);

  const openLinkDialog = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href || "";
    setLinkInitialUrl(previousUrl);
    setShowLinkDialog(true);
  }, [editor]);

  const handleLinkSubmit = useCallback((url: string) => {
    if (!editor) return;
    setShowLinkDialog(false);
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

  return (
    <>
      <div
        className={`sticky top-[64px] z-10 bg-white border-b border-gray-200 py-2 flex flex-wrap items-center gap-0.5 ${className || ""}`}
        id="editor_toolbar"
        data-testid="editor-toolbar"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleImageUpload}
        />
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
          onClick={openLinkDialog}
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
      <LinkDialog
        open={showLinkDialog}
        onClose={() => setShowLinkDialog(false)}
        onSubmit={handleLinkSubmit}
        initialUrl={linkInitialUrl}
      />
    </>
  );
}
