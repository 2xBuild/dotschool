"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { useRef, useCallback, useState } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link as LinkIcon,
  ImageIcon,
  Undo,
  Redo,
  CodeSquare,
  Globe,
  Loader2,
} from "lucide-react";

import { LinkEmbed } from "./link-embed-node";

type RichTextEditorProps = {
  content?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
  minimal?: boolean;
};

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded p-1.5 transition-colors ${
        active
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      } disabled:opacity-30`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="mx-0.5 h-5 w-px bg-border" />;
}

export function RichTextEditor({
  content = "",
  onChange,
  placeholder,
  className = "",
  minimal = false,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [embedding, setEmbedding] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
      LinkEmbed,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `rte-content outline-none min-h-[120px] px-3 py-2 text-sm ${minimal ? "min-h-[80px]" : ""}`,
      },
    },
  });

  const handleImageUpload = useCallback(async () => {
    fileInputRef.current?.click();
  }, []);

  const onFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;

      const fd = new FormData();
      fd.append("file", file);

      try {
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = (await res.json()) as { url?: string };
        if (typeof data.url === "string" && data.url) {
          editor.chain().focus().setImage({ src: data.url }).run();
        }
      } catch {}

      e.target.value = "";
    },
    [editor],
  );

  const handleLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const handleEmbed = useCallback(async () => {
    if (!editor) return;
    const raw = window.prompt(
      "Paste a link to embed (YouTube, blog, etc.)",
      "https://",
    );
    const url = raw?.trim();
    if (!url || url === "https://" || url === "http://") return;

    let hostname = "";
    try {
      hostname = new URL(url).hostname;
    } catch {
      alert("Invalid URL");
      return;
    }

    setEmbedding(true);
    try {
      const res = await fetch(
        `/api/unfurl?url=${encodeURIComponent(url)}`,
      );
      const data = (await res.json()) as {
        url?: string;
        title?: string;
        description?: string;
        image?: string;
        siteName?: string;
        error?: string;
      };

      editor
        .chain()
        .focus()
        .insertContent({
          type: "linkEmbed",
          attrs: {
            url: data.url ?? url,
            title: data.title || url,
            description: data.description ?? null,
            image: data.image ?? null,
            siteName: data.siteName ?? hostname,
          },
        })
        .run();
    } catch {
      // If unfurl fails entirely, still insert a minimal embed
      editor
        .chain()
        .focus()
        .insertContent({
          type: "linkEmbed",
          attrs: {
            url,
            title: url,
            description: null,
            image: null,
            siteName: hostname,
          },
        })
        .run();
    } finally {
      setEmbedding(false);
    }
  }, [editor]);

  if (!editor) return null;

  const iconSize = "size-3.5";

  return (
    <div
      className={`rounded-md border border-input bg-background overflow-hidden ${className}`}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1.5 bg-muted/30">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Strikethrough"
        >
          <Strikethrough className={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="Inline code"
        >
          <Code className={iconSize} />
        </ToolbarButton>

        {!minimal && (
          <>
            <ToolbarDivider />
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              active={editor.isActive("heading", { level: 1 })}
              title="Heading 1"
            >
              <Heading1 className={iconSize} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              active={editor.isActive("heading", { level: 2 })}
              title="Heading 2"
            >
              <Heading2 className={iconSize} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              active={editor.isActive("heading", { level: 3 })}
              title="Heading 3"
            >
              <Heading3 className={iconSize} />
            </ToolbarButton>
          </>
        )}

        <ToolbarDivider />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet list"
        >
          <List className={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numbered list"
        >
          <ListOrdered className={iconSize} />
        </ToolbarButton>

        {!minimal && (
          <>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive("blockquote")}
              title="Quote"
            >
              <Quote className={iconSize} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              active={editor.isActive("codeBlock")}
              title="Code block"
            >
              <CodeSquare className={iconSize} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="Divider"
            >
              <Minus className={iconSize} />
            </ToolbarButton>
          </>
        )}

        <ToolbarDivider />
        <ToolbarButton
          onClick={handleLink}
          active={editor.isActive("link")}
          title="Link"
        >
          <LinkIcon className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={handleImageUpload} title="Upload image">
          <ImageIcon className={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={handleEmbed}
          disabled={embedding}
          title="Embed link (YouTube, blog, etc.)"
        >
          {embedding ? (
            <Loader2 className={`${iconSize} animate-spin`} />
          ) : (
            <Globe className={iconSize} />
          )}
        </ToolbarButton>

        <ToolbarDivider />
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className={iconSize} />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  );
}
