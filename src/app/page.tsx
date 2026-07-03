import Link from "next/link";

import { World } from "@/components/world/world";
import { getRepos } from "@/lib/github";
import { site } from "@/lib/site";
import { getArticles } from "@/lib/zenn";

export default async function Home() {
  const [repos, articles] = await Promise.all([getRepos(6), getArticles(6)]);

  return (
    <main>
      {/* The gallery is a canvas; keep the essentials in the document for
          crawlers, screen readers, and anyone with JavaScript disabled. */}
      <div className="sr-only">
        <h1>
          {site.name} — {site.role}
        </h1>
        <p>{site.intro}</p>
        <p>
          This page is an interactive 3D gallery. Prefer plain text? Read the{" "}
          <Link href="/classic">classic edition</Link>.
        </p>
      </div>

      <World repos={repos} articles={articles} />

      <noscript>
        <div className="fixed inset-0 z-50 grid place-items-center bg-(--bg) p-6">
          <div className="glass max-w-md p-8">
            <p className="eyebrow">{site.handle}.me</p>
            <p className="mt-4 text-lg">
              The interactive gallery needs JavaScript. The classic edition
              does not:
            </p>
            <Link href="/classic" className="rule-link mt-4 inline-block">
              Read the classic edition →
            </Link>
          </div>
        </div>
      </noscript>
    </main>
  );
}
