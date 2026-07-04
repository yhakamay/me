import type { Metadata } from "next";

import { World } from "@/components/world/world";
import { getRepos } from "@/lib/github";
import { site } from "@/lib/site";
import { getArticles } from "@/lib/zenn";

/**
 * Hidden command: /play drops you straight into the gallery, no intro.
 * Reachable by typing the URL, or via the ⌘K palette ("/play").
 */
export const metadata: Metadata = {
  title: `${site.handle} — play`,
  robots: { index: false },
};

export default async function Play() {
  const [repos, articles] = await Promise.all([getRepos(6), getArticles(6)]);
  return <World repos={repos} articles={articles} autoEnter />;
}
