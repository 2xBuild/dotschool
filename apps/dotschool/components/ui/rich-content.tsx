import { cn } from "@/lib/utils";

type RichContentProps = {
  html: string | null;
  className?: string;
};

/**
 * Renders rich HTML content from the Tiptap editor.
 * Falls back to plain text rendering (whitespace-pre-wrap) for
 * content that doesn't contain HTML tags.
 */
export function RichContent({ html, className }: RichContentProps) {
  if (!html?.trim()) return null;

  const hasHtml = /<[a-z][\s\S]*>/i.test(html);

  if (!hasHtml) {
    return (
      <p className={cn("whitespace-pre-wrap text-sm leading-relaxed text-foreground", className)}>
        {html}
      </p>
    );
  }

  return (
    <div
      className={cn("rich-content", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
