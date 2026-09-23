import type { BlogSearchEntry } from "./blog";
import { franchiseWomanPodcast } from "../data/site-content";

function esc(value: string | undefined): string {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]!));
}
const headphones = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 14v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="12" width="4" height="8" rx="2"/><rect x="17" y="12" width="4" height="8" rx="2"/></svg>';

const platformIcons: Record<string, string> = {
  spotify: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M6 9c4-1.5 8-1 12 1M7 12c3-1 6.5-.6 10 1M8 15c2.5-.7 5-.4 8 1"/></svg>',
  apple: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="9" r="2"/><path d="M9.5 14c0-2 5-2 5 0l-.8 6h-3.4zM6.5 16a8 8 0 1 1 11 0M8 12a5 5 0 1 1 8 0"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 7s-.2-2-2-2.5C18 4 12 4 12 4s-6 0-8 .5C2.2 5 2 7 2 7s-.5 2-.5 5 .5 5 .5 5 .2 2 2 2.5c2 .5 8 .5 8 .5s6 0 8-.5c1.8-.5 2-2.5 2-2.5s.5-2 .5-5S22 7 22 7ZM10 15.5v-7l6 3.5z"/></svg>'
};

/** Shared markup keeps paginated cards and search results identical. */
export function podcastCardHtml(entry: BlogSearchEntry): string {
  const postUrl = "/" + entry.slug.replace("wordpress-import/", "");
  const thumbnail = entry.imageUrl
    ? `<img src="${esc(entry.imageUrl)}" alt="${esc(entry.imageAlt)}" loading="lazy" decoding="async" width="640" height="360" />`
    : `<span class="podcast-card__placeholder">${headphones}<span>Podcast episode</span></span>`;
  return `<article class="podcast-card">
    <a class="podcast-card__image" href="${esc(postUrl)}" aria-label="${esc('Read podcast article: ' + entry.title)}">
      ${thumbnail}
    </a>
    <div class="podcast-card__body">
      <p class="podcast-card__label">Podcast episode</p>
      <h2 class="podcast-card__title"><a href="${esc(postUrl)}">${esc(entry.title)}</a></h2>
      ${entry.dateLabel ? `<p class="podcast-card__date">${esc(entry.dateLabel)}</p>` : ""}
      <p class="podcast-card__excerpt">${esc(entry.excerpt)}</p>
      <div class="podcast-card__actions">
        <p class="podcast-card__listen-label">Listen on</p>
        <div class="podcast-card__platforms">
          ${franchiseWomanPodcast.platforms.map(platform => {
            const episodeUrl = platform.icon === "spotify" ? entry.spotifyUrl
              : platform.icon === "apple" ? entry.appleUrl : entry.watchUrl;
            const destination = episodeUrl || platform.href;
            const context = episodeUrl ? entry.title : franchiseWomanPodcast.name;
            const label = `${platform.label}: ${context} (opens in a new tab)`;
            return `<a class="podcast-card__platform" href="${esc(destination)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(label)}" title="${esc(episodeUrl ? 'Open episode' : 'Browse the show')}" data-platform="${esc(platform.icon)}">${platformIcons[platform.icon] || headphones}<span>${esc(platform.label)}</span></a>`;
          }).join("")}
        </div>
      </div>
    </div>
  </article>`;
}
