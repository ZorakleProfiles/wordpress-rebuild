/** Media destinations come only from the episode's own embeds and links. */
export interface PodcastLinks { watchUrl?: string; listenUrl?: string; spotifyUrl?: string; appleUrl?: string; }
function youTubeIdFromUrl(url: URL): string | undefined {
  const host = url.hostname.replace(/^www\./, "");
  if (!["youtube.com", "m.youtube.com", "youtube-nocookie.com", "youtu.be"].includes(host)) return undefined;
  const id = host === "youtu.be" ? url.pathname.split("/")[1]
    : url.searchParams.get("v") || url.pathname.match(/^\/(?:embed|shorts|v)\/([^/]+)/)?.[1];
  return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : undefined;
}

/** ID of the first YouTube video embedded (not merely linked) in the body. */
export function getEmbeddedYouTubeId(body: unknown[]): string | undefined {
  for (const block of body) {
    const item = block as { _type?: string; url?: unknown } | null;
    if (item?._type !== "embed" || typeof item.url !== "string") continue;
    try {
      const id = youTubeIdFromUrl(new URL(item.url.trim()));
      if (id) return id;
    } catch { /* Ignore malformed media URLs. */ }
  }
  return undefined;
}

export function getPodcastLinks(body: unknown[]): PodcastLinks {
  const links: PodcastLinks = {};
  for (const block of body) {
    if (!block || typeof block !== "object") continue;
    const item = block as { _type?: string; url?: unknown; markDefs?: { href?: unknown }[] };
    const candidates = [item._type === "embed" ? item.url : undefined,
      ...(Array.isArray(item.markDefs) ? item.markDefs.map(mark => mark.href) : [])];
    for (const candidate of candidates) {
      if (typeof candidate !== "string") continue;
      try {
        const url = new URL(candidate);
        if (url.protocol !== "https:") continue;
        const host = url.hostname.replace(/^www\./, "");
        const id = youTubeIdFromUrl(url);
        if (id) links.watchUrl ??= `https://www.youtube.com/watch?v=${id}`;
        if (host === "open.spotify.com" && /^\/(?:embed\/)?episode\/[^/]+/.test(url.pathname)) {
          url.pathname = url.pathname.replace(/^\/embed\//, "/");
          links.spotifyUrl ??= url.href;
          links.listenUrl ??= url.href;
        }
        if (host === "podcasts.apple.com" && url.searchParams.has("i")) {
          links.appleUrl ??= url.href;
          links.listenUrl ??= url.href;
        }
      } catch { /* Ignore malformed media URLs. */ }
    }
  }
  return links;
}
