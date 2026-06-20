const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};

/** Escape text for safe HTML body insertion. */
export function escapeHtml(value: string): string {
  return String(value).replace(/[&<>"']/g, ch => HTML_ESCAPE_MAP[ch] ?? ch);
}

/** Escape text for safe use inside HTML attribute values. */
export function escapeHtmlAttr(value: string): string {
  return escapeHtml(value);
}
