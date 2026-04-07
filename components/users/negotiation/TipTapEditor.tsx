"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState } from "react";
import { Bold, Italic, List, ListOrdered, Heading2, Undo, Redo, Eye, Edit3 } from "lucide-react";

interface TipTapEditorProps {
  content: string;
  previewHtml?: string;
  onChange: (html: string) => void;
  minHeight?: number;
}

export function TipTapEditor({ content, previewHtml, onChange, minHeight = 240 }: TipTapEditorProps) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none p-6 text-base text-foreground font-mono leading-relaxed",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (content !== current) {
      editor.commands.setContent(content, { emitUpdate: false } as any);
    }
  }, [content, editor]);

  const ToolbarBtn = ({
    onClick,
    active,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={`h-10 w-10 flex items-center justify-center border-0 md:border-r-2 border-border transition-colors ${active ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-primary/20"}`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-gray-200 rounded-md bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap md:flex-nowrap items-center justify-between border-b border-gray-200 bg-gray-50">
        <div className="flex items-center flex-wrap">
          <ToolbarBtn onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive("bold")}>
            <Bold className="h-5 w-5" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive("italic")}>
            <Italic className="h-5 w-5" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive("heading", { level: 2 })}>
            <Heading2 className="h-5 w-5" />
          </ToolbarBtn>
          <div className="hidden md:block w-0.5 h-10 bg-border mx-2" />
          <ToolbarBtn onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive("bulletList")}>
            <List className="h-5 w-5" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive("orderedList")}>
            <ListOrdered className="h-5 w-5" />
          </ToolbarBtn>
          <div className="hidden md:block w-0.5 h-10 bg-border mx-2" />
          <ToolbarBtn onClick={() => editor?.chain().focus().undo().run()}>
            <Undo className="h-5 w-5" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor?.chain().focus().redo().run()}>
            <Redo className="h-5 w-5" />
          </ToolbarBtn>
        </div>
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setMode("edit")}
            className={`flex items-center gap-2 h-10 px-4 font-medium text-sm transition-colors border-l border-gray-200 ${mode === "edit" ? "bg-blue-50 text-blue-700" : "bg-white text-gray-500 hover:bg-gray-50"}`}
          >
            <Edit3 className="h-4 w-4" /> Edit
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={`flex items-center gap-2 h-10 px-4 font-medium text-sm transition-colors border-l border-gray-200 ${mode === "preview" ? "bg-blue-50 text-blue-700" : "bg-white text-gray-500 hover:bg-gray-50"}`}
          >
            <Eye className="h-4 w-4" /> Preview
          </button>
        </div>
      </div>

      {/* Editor / Preview */}
      <div className="bg-background relative">
        <div className="absolute top-2 right-2 flex gap-2">
          <span className="bg-muted px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground border border-border">AI GENERATED</span>
        </div>

        {mode === "edit" ? (
          <EditorContent
            editor={editor}
            style={{ minHeight }}
            className="overflow-y-auto"
          />
        ) : (
          <div className="relative">
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />
            <div
              className="p-6 relative z-10 overflow-y-auto prose prose-base max-w-none text-foreground font-sans bg-transparent"
              style={{ minHeight }}
              dangerouslySetInnerHTML={{ __html: previewHtml || editor?.getHTML() || "" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
