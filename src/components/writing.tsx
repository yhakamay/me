import Link from "next/link";

import { CardGrid } from "@/components/card-grid";
import { formatDate } from "@/lib/format";
import { Article } from "@/types/article";

export function Writing({ articles }: { articles: Article[] }) {
  return (
    <CardGrid items={articles} empty="No articles yet — words are brewing.">
      {(article) => (
        <li
          key={article.guid}
          className="border-b border-(--rule) last:border-0"
        >
          <Link
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-baseline justify-between gap-6 py-4"
          >
            <span className="min-w-0">
              <span className="block text-lg font-medium leading-snug group-hover:italic">
                {article.title}
              </span>
              {article.description && (
                <span className="mt-0.5 block truncate text-sm leading-snug text-(--muted)">
                  {article.description}
                </span>
              )}
            </span>
            <span className="shrink-0 whitespace-nowrap text-right text-xs text-(--muted)">
              {formatDate(article.pubDate, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </Link>
        </li>
      )}
    </CardGrid>
  );
}
