
"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import {
  Bold, Italic, List, ListOrdered, Heading2,
  Undo, Redo, Strikethrough, AlignLeft, AlignCenter, AlignRight,
} from "lucide-react";
import DOMPurify from "dompurify";
import { ScrollArea } from "@/components/ui/scroll-area";

const ToolbarBtn = ({
  onClick, active, title, children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`p-1.5 rounded transition-colors ${
      active
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`}
  >
    {children}
  </button>
);

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  error?: string;
}

const RichTextEditor = ({ value, onChange, error }: RichTextEditorProps) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value || "",
     onUpdate({ editor }) {
      const html = editor.getHTML();
      const clean = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
          "p", "br", "strong", "em", "u", "s", "h2",
          "ul", "ol", "li", "span", "div",
        ],
        ALLOWED_ATTR: ["style", "class"],
      });
      onChange(clean); 
    },
    editorProps: {
      attributes: {
        class: "min-h-[160px] px-3 py-2 text-sm focus:outline-none prose prose-sm max-w-none",
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [editor, value]);

  if (!editor) return null;

  return (
    
      <div className={`border rounded-md overflow-hidden mt-2 ${error ? "border-destructive" : "border-input"}`}>
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b bg-muted/40">
        <ToolbarBtn title="Undo" onClick={() => editor.chain().focus().undo().run()}><Undo size={14} /></ToolbarBtn>
        <ToolbarBtn title="Redo" onClick={() => editor.chain().focus().redo().run()}><Redo size={14} /></ToolbarBtn>
        <div className="w-px h-4 bg-border mx-1" />
        <ToolbarBtn title="Heading" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={14} /></ToolbarBtn>
        <div className="w-px h-4 bg-border mx-1" />
        <ToolbarBtn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={14} /></ToolbarBtn>
        <ToolbarBtn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={14} /></ToolbarBtn>
        <ToolbarBtn title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><span className="text-xs font-medium underline">U</span></ToolbarBtn>
        <ToolbarBtn title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough size={14} /></ToolbarBtn>
        <div className="w-px h-4 bg-border mx-1" />
        <ToolbarBtn title="Bullet List" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={14} /></ToolbarBtn>
        <ToolbarBtn title="Ordered List" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={14} /></ToolbarBtn>
        <div className="w-px h-4 bg-border mx-1" />
        <ToolbarBtn title="Align Left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}><AlignLeft size={14} /></ToolbarBtn>
        <ToolbarBtn title="Align Center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}><AlignCenter size={14} /></ToolbarBtn>
        <ToolbarBtn title="Align Right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}><AlignRight size={14} /></ToolbarBtn>
      </div>
      <ScrollArea className="h-52">
  <EditorContent editor={editor} /> 
      </ScrollArea>
   
    </div>
    
  );
};

export default RichTextEditor;