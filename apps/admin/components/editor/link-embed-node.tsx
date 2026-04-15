"use client";

import {
  Node,
  ReactNodeViewRenderer,
  NodeViewWrapper,
} from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";

function LinkEmbedView({ node, deleteNode }: NodeViewProps) {
  const { url, title, description, image, siteName } = node.attrs as Record<
    string,
    string | null
  >;

  return (
    <NodeViewWrapper className="my-3" data-drag-handle>
      <a
        href={url ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
        contentEditable={false}
        className="link-embed group relative flex overflow-hidden rounded-lg border border-border bg-muted/20 transition-colors hover:bg-muted/40"
      >
        {image && (
          <div className="relative h-[120px] w-[200px] shrink-0 overflow-hidden bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-4 py-3">
          {title && (
            <p className="text-sm font-semibold leading-snug text-foreground line-clamp-2">
              {title}
            </p>
          )}
          {description && (
            <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}
          {siteName && (
            <span className="text-[11px] text-muted-foreground/70">
              {siteName}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            deleteNode();
          }}
          className="absolute right-2 top-2 hidden rounded bg-background/80 p-1 text-muted-foreground hover:text-destructive group-hover:block"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-3.5"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </a>
    </NodeViewWrapper>
  );
}

export const LinkEmbed = Node.create({
  name: "linkEmbed",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      url: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute("data-url"),
        renderHTML: (attrs: Record<string, unknown>) =>
          attrs.url ? { "data-url": attrs.url as string } : {},
      },
      title: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute("data-title"),
        renderHTML: (attrs: Record<string, unknown>) =>
          attrs.title ? { "data-title": attrs.title as string } : {},
      },
      description: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute("data-description"),
        renderHTML: (attrs: Record<string, unknown>) =>
          attrs.description
            ? { "data-description": attrs.description as string }
            : {},
      },
      image: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute("data-image"),
        renderHTML: (attrs: Record<string, unknown>) =>
          attrs.image ? { "data-image": attrs.image as string } : {},
      },
      siteName: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute("data-site-name"),
        renderHTML: (attrs: Record<string, unknown>) =>
          attrs.siteName
            ? { "data-site-name": attrs.siteName as string }
            : {},
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-link-embed]" }];
  },

  renderHTML({ node }) {
    const { url, title, description, image, siteName } = node.attrs;

    const linkChildren: unknown[] = [];

    if (image) {
      linkChildren.push([
        "img",
        { src: image, alt: "", class: "link-embed-image" },
      ]);
    }

    const bodyChildren: unknown[] = [];
    if (title) {
      bodyChildren.push(["p", { class: "link-embed-title" }, title]);
    }
    if (description) {
      bodyChildren.push([
        "p",
        { class: "link-embed-description" },
        description,
      ]);
    }
    if (siteName) {
      bodyChildren.push(["span", { class: "link-embed-site" }, siteName]);
    }
    linkChildren.push(["div", { class: "link-embed-body" }, ...bodyChildren]);

    return [
      "div",
      {
        "data-link-embed": "",
        "data-url": url ?? "",
        "data-title": title ?? "",
        "data-description": description ?? "",
        "data-image": image ?? "",
        "data-site-name": siteName ?? "",
        class: "link-embed",
      },
      [
        "a",
        {
          href: url ?? "#",
          target: "_blank",
          rel: "noopener noreferrer",
          class: "link-embed-inner",
        },
        ...linkChildren,
      ],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(LinkEmbedView);
  },
});
