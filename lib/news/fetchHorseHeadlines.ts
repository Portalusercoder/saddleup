import Parser from "rss-parser";

/** Public RSS feeds only (no API keys). Tried in order until enough headlines. */
const RSS_FEEDS = [
  "https://news.google.com/rss/search?q=horse+equestrian+equine&hl=en-US&gl=US&ceid=US:en",
  "https://horsenation.com/feed/",
  "https://thehorse.com/feed/",
] as const;

function normalizeTitle(raw: string): string | null {
  let t = raw.replace(/\s+/g, " ").trim();
  if (!t || t.length < 12) return null;
  if (/^\[Removed\]/i.test(t)) return null;
  const cut = t.lastIndexOf(" - ");
  if (cut >= 20 && cut < t.length - 3) {
    t = t.slice(0, cut).trim();
  }
  if (t.length < 12) return null;
  return t.length > 160 ? `${t.slice(0, 157)}…` : t;
}

function dedupe(titles: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const title of titles) {
    const key = title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(title);
  }
  return out;
}

async function fetchFromRssFeeds(): Promise<string[] | null> {
  const parser = new Parser();

  for (const url of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(url);
      const raw = (feed.items ?? [])
        .map((item) => normalizeTitle(item.title ?? ""))
        .filter((t): t is string => Boolean(t));
      const headlines = dedupe(raw);
      if (headlines.length >= 3) return headlines;
    } catch {
      continue;
    }
  }

  return null;
}

export type HorseHeadlinesSource = "rss" | "none";

export async function fetchHorseHeadlines(): Promise<{
  headlines: string[];
  source: HorseHeadlinesSource;
}> {
  const fromRss = await fetchFromRssFeeds();
  if (fromRss) return { headlines: fromRss, source: "rss" };

  return { headlines: [], source: "none" };
}
