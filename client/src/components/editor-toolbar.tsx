import { useState, useCallback } from "react";
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
          ? "bg-[#F0E6FF] text-[#6600ff]"
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

export function EditorToolbar({ editor, className }: EditorToolbarProps) {
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

  return (
    <div
      className={`sticky top-[64px] z-10 bg-white border-b border-gray-200 py-2 flex flex-wrap items-center gap-0.5 ${className || ""}`}
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
  );
}
