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
import { EditorToolbar } from "./editor-toolbar";
import { Eye, Pencil } from "lucide-react";
import type { Editor } from "@tiptap/react";

interface UseRichTextEditorOptions {
  placeholder?: string;
  content?: string;
  onUpdate?: (html: string) => void;
}

export function useRichTextEditor(options: UseRichTextEditorOptions = {}) {
  const { placeholder = "Start writing...", content, onUpdate } = options;

  const editor = useEditor({
    content,
    onUpdate: onUpdate ? ({ editor }) => onUpdate(editor.getHTML()) : undefined,
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
        placeholder,
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

  return editor;
}

interface RichTextEditorContentProps {
  editor: Editor;
  className?: string;
  toolbarClassName?: string;
}

export function RichTextEditorContent({ editor, className, toolbarClassName }: RichTextEditorContentProps) {
  return (
    <>
      <EditorToolbar editor={editor} className={toolbarClassName} />
      <div className={`min-h-[400px] bg-white ${className || ""}`}>
        <EditorContent
          editor={editor}
          className="rich-text-editor-content"
          data-testid="editor-content"
        />
      </div>
    </>
  );
}

interface EditorPreviewProps {
  html: string;
  className?: string;
}

export function EditorPreview({ html, className }: EditorPreviewProps) {
  return (
    <div
      className={`prose prose-sm sm:prose lg:prose-lg max-w-none font-serif editor-preview ${className || ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

interface EditorModeToggleProps {
  mode: "editor" | "preview";
  onModeChange: (mode: "editor" | "preview") => void;
}

export function EditorModeToggle({ mode, onModeChange }: EditorModeToggleProps) {
  return (
    <div className="flex rounded-full border border-gray-200 overflow-hidden">
      <button
        className={`flex-1 py-2 px-4 text-sm font-serif transition-colors ${
          mode === "editor"
            ? "bg-foreground text-background"
            : "bg-white text-foreground hover:bg-[#F5F5F5]"
        }`}
        onClick={() => onModeChange("editor")}
        data-testid="button-edit-mode"
      >
        <div className="flex items-center justify-center gap-1.5">
          <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
          Edit Mode
        </div>
      </button>
      <button
        className={`flex-1 py-2 px-4 text-sm font-serif transition-colors ${
          mode === "preview"
            ? "bg-foreground text-background"
            : "bg-white text-foreground hover:bg-[#F5F5F5]"
        }`}
        onClick={() => onModeChange("preview")}
        data-testid="button-preview-mode"
      >
        <div className="flex items-center justify-center gap-1.5">
          <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
          Preview
        </div>
      </button>
    </div>
  );
}

export const richTextEditorStyles = `
  .rich-text-editor-content .tiptap {
    outline: none;
    min-height: 400px;
    font-family: 'Marcellus', serif;
  }
  .rich-text-editor-content .tiptap p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    float: left;
    color: #9ca3af;
    pointer-events: none;
    height: 0;
  }
  .rich-text-editor-content .tiptap h1 {
    font-size: 2em;
    font-weight: 400;
    margin-top: 1em;
    margin-bottom: 0.5em;
    font-family: 'Marcellus', serif;
  }
  .rich-text-editor-content .tiptap h2 {
    font-size: 1.5em;
    font-weight: 400;
    margin-top: 0.8em;
    margin-bottom: 0.4em;
    font-family: 'Marcellus', serif;
  }
  .rich-text-editor-content .tiptap h3 {
    font-size: 1.25em;
    font-weight: 400;
    margin-top: 0.6em;
    margin-bottom: 0.3em;
    font-family: 'Marcellus', serif;
  }
  .rich-text-editor-content .tiptap p {
    margin-bottom: 0.75em;
    line-height: 1.7;
  }
  .rich-text-editor-content .tiptap blockquote {
    border-left: 3px solid #6600ff;
    padding-left: 1em;
    color: #666;
    margin: 1em 0;
    font-style: italic;
  }
  .rich-text-editor-content .tiptap pre {
    background: #1e1e2e;
    color: #cdd6f4;
    padding: 1em;
    border-radius: 8px;
    overflow-x: auto;
    margin: 1em 0;
  }
  .rich-text-editor-content .tiptap code {
    background: #f0f0f0;
    padding: 0.2em 0.4em;
    border-radius: 4px;
    font-size: 0.85em;
  }
  .rich-text-editor-content .tiptap pre code {
    background: none;
    padding: 0;
    border-radius: 0;
    color: inherit;
  }
  .rich-text-editor-content .tiptap img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 1em 0;
  }
  .rich-text-editor-content .tiptap ul {
    padding-left: 1.5em;
    margin: 0.5em 0;
    list-style-type: disc;
  }
  .rich-text-editor-content .tiptap ol {
    padding-left: 1.5em;
    margin: 0.5em 0;
    list-style-type: decimal;
  }
  .rich-text-editor-content .tiptap ul ul {
    list-style-type: circle;
  }
  .rich-text-editor-content .tiptap ul ul ul {
    list-style-type: square;
  }
  .rich-text-editor-content .tiptap li {
    margin-bottom: 0.25em;
    display: list-item;
  }
  .rich-text-editor-content .tiptap li p {
    margin-bottom: 0;
  }
  .rich-text-editor-content .tiptap hr {
    border: none;
    border-top: 1px solid #e5e5e5;
    margin: 1.5em 0;
  }
  .rich-text-editor-content .tiptap a {
    color: #6600ff;
    text-decoration: underline;
  }
  .rich-text-editor-content .tiptap table {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
  }
  .rich-text-editor-content .tiptap table td,
  .rich-text-editor-content .tiptap table th {
    border: 1px solid #e5e5e5;
    padding: 0.5em 0.75em;
    text-align: left;
  }
  .rich-text-editor-content .tiptap table th {
    background: #f5f5f5;
    font-weight: 400;
  }
  .editor-preview ul {
    padding-left: 1.5em;
    list-style-type: disc;
  }
  .editor-preview ol {
    padding-left: 1.5em;
    list-style-type: decimal;
  }
  .editor-preview li {
    display: list-item;
    margin-bottom: 0.25em;
  }
  .editor-preview li p {
    margin-bottom: 0;
  }
`;
