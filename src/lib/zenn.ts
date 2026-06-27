import { XMLParser } from "fast-xml-parser";

import { Article } from "@/types/article";

const FEED_URL = "https://zenn.dev/yhakamay/feed";
const REVALIDATE = 60 * 60 * 6; // 6h

type RawItem = {
  title?: string;
  link?: string;
  guid?: string | { "#text": string };
  pubDate?: string;
  description?: string;
};

const parser = new XMLParser({ ignoreAttributes: false });

/** Fetch and parse the latest Zenn articles from the RSS feed. */
export async function getArticles(limit = 6): Promise<Article[]> {
  try {
    const res = await fetch(FEED_URL, { next: { revalidate: REVALIDATE } });

    if (!res.ok) {
      throw new Error(`Zenn feed: ${res.status} ${res.statusText}`);
    }

    const xml = await res.text();
    const feed = parser.parse(xml);
    const items: RawItem[] = feed?.rss?.channel?.item ?? [];

    return items
      .filter((item) => item.title)
      .slice(0, limit)
      .map((item) => ({
        title: String(item.title ?? ""),
        link: String(item.link ?? ""),
        guid:
          typeof item.guid === "object"
            ? String(item.guid["#text"])
            : String(item.guid ?? item.link ?? ""),
        pubDate: String(item.pubDate ?? ""),
        description: String(item.description ?? ""),
      }));
  } catch (err) {
    console.error("Failed to fetch articles:", err);
    return [];
  }
}
