const SIMPLE_MARKUP = new Map([
  ["<strong>", "<strong>"], ["</strong>", "</strong>"],
  ["<em>", "<em>"], ["</em>", "</em>"],
  ["<h3>", "<h3>"], ["</h3>", "</h3>"],
  ["</a>", "</a>"]
]);

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function sanitizeLimitedRichText(value: string) {
  return value.split(/(<[^>]+>)/g).map((token) => {
    const simple = SIMPLE_MARKUP.get(token.trim().toLowerCase());
    if (simple) return simple;

    const anchor = token.match(/^<a\s+href\s*=\s*(["'])([\s\S]*?)\1\s*>$/i);
    if (anchor) {
      const href = anchor[2].trim().replace(/[\u0000-\u001f\u007f]/g, "");
      const safe = /^(?:https?:\/\/|mailto:|#)/i.test(href) || /^\/(?!\/)/.test(href);
      return `<a href="${escapeHtml(safe ? href : "#")}" rel="noreferrer">`;
    }

    return escapeHtml(token);
  }).join("").replace(/\r?\n/g, "<br />");
}

export function richTextToPlainText(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
