import sanitizeHtml from "sanitize-html";

/**
 * Allow-list matching what the Tiptap editor can produce (headings, lists,
 * quotes, code, links, basic marks). Everything else - scripts, styles,
 * iframes, event handlers, `javascript:` URLs, inline images - is dropped.
 * Run on every write AND before every render, so stored content is never
 * trusted blindly.
 */
const RICH_TEXT_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "h1", "h2", "h3", "h4", "p", "br", "hr",
    "strong", "b", "em", "i", "u", "s",
    "code", "pre", "blockquote",
    "ul", "ol", "li", "a",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    ol: ["start"],
  },
  allowedClasses: { code: [/^language-[\w-]+$/] },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowProtocolRelative: false,
  disallowedTagsMode: "discard",
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", {
      rel: "noopener noreferrer nofollow",
      target: "_blank",
    }),
  },
};

export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, RICH_TEXT_OPTIONS).trim();
}

/** Visible text of an HTML string (entities decoded, tags removed). */
export function htmlToPlainText(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** True for content that renders nothing (e.g. Tiptap's empty `<p></p>`). */
export function isRichTextEmpty(html: string | null | undefined): boolean {
  return !html || htmlToPlainText(html).length === 0;
}

/** Rough reading time in whole minutes (min 1) at ~220 wpm. */
export function readingTimeMinutes(html: string): number {
  const words = htmlToPlainText(html).split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
