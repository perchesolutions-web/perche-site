/*
  Personalized link previews for demo links.

  A demo link (made on /links) names one fence company:
    /demo?c=Acme+Fence+Co.&n=Mike&w=acmefence.com&l=Coral+Gables,+FL

  The page personalizes itself with JavaScript, but link previews in texts, iMessage, WhatsApp, LinkedIn and
  Facebook read the HTML without running it. This puts the company's name in the page title and share tags so the
  preview says who the page was made for. Nothing else on the page changes, and any error leaves the page as it was.

  Values are cleaned the same way assets/tq-prospect.js cleans them, length-limited, and HTML-escaped.
*/

const CONTROL = /[\u0000-\u001f\u007f<>{}\\]/g;

function clean(value, max) {
  return String(value || "").replace(CONTROL, "").replace(/\s+/g, " ").trim().slice(0, max);
}

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// The prospect named by a demo link, or null when the link isn't personalized.
export function prospectFrom(params) {
  const name = clean(params.get("c"), 60);
  if (!name) return null;
  const first = clean(params.get("n"), 30).replace(/[^A-Za-z\u00C0-\u024F' -]/g, "").trim();
  let site = clean(params.get("w"), 100).toLowerCase()
    .replace(/^[a-z]+:\/\//, "").replace(/^www\./, "").split(/[\/?#:]/)[0];
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(site) || site.length > 63) site = "";
  return { name, first, site };
}

export function previewText(p) {
  const where = p.site || "your website";
  return {
    title: p.name + " \u00b7 Instant quote preview",
    // Anyone can type a link with any company's name, so the preview says it's a preview made for them,
    // never that it's the company's own page.
    shareTitle: "Instant quote page preview for " + p.name,
    description: (p.first ? p.first + ", here\u2019s" : "Here\u2019s") + " the quote page homeowners would use on " + where +
      ". Search an address, trace the fence, and see the price."
  };
}

// Sets the content of <meta {attr}="{key}" content="..."> (adding the tag before </head> if it's missing).
function setMeta(html, attr, key, value) {
  const tag = '<meta ' + attr + '="' + key + '" content="' + escapeHtml(value) + '">';
  const re = new RegExp('<meta\\s+' + attr + '="' + key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '"\\s+content="[^"]*"\\s*/?>', "i");
  if (re.test(html)) return html.replace(re, () => tag);
  return html.replace(/<\/head>/i, () => tag + "\n</head>");
}

export function personalizeHtml(html, p, pageUrl) {
  const t = previewText(p);
  let out = html.replace(/<title>[^<]*<\/title>/i, () => "<title>" + escapeHtml(t.title) + "</title>");
  out = setMeta(out, "name", "description", t.description);
  out = setMeta(out, "property", "og:title", t.shareTitle);
  out = setMeta(out, "property", "og:description", t.description);
  // Share apps treat og:url as the page's address; it has to be this link, or they fetch the generic demo instead.
  if (pageUrl) out = setMeta(out, "property", "og:url", pageUrl);
  out = setMeta(out, "name", "twitter:title", t.shareTitle);
  out = setMeta(out, "name", "twitter:description", t.description);
  return out;
}

export default async (request, context) => {
  let p = null;
  let url;
  try {
    url = new URL(request.url);
    p = prospectFrom(url.searchParams);
  } catch (e) {
    p = null;
  }
  if (!p) return; // not a personalized link: serve the page untouched

  const res = await context.next();
  const type = res.headers.get("content-type") || "";
  if (res.status !== 200 || type.indexOf("text/html") === -1) return res;

  const html = await res.text();
  let out = html;
  try {
    out = personalizeHtml(html, p, url.toString());
  } catch (e) {
    out = html;
  }
  const headers = new Headers(res.headers);
  headers.delete("content-length");
  headers.delete("etag");
  return new Response(out, { status: res.status, statusText: res.statusText, headers });
};

export const config = { path: ["/demo", "/demo.html"] };
