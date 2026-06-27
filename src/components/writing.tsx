import { SpotlightCard } from "@/components/spotlight-card";
import { Article } from "@/types/article";

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function Writing({ articles }: { articles: Article[] }) {
  if (articles.length === 0) {
    return (
      <p className="text-sm text-(--muted)">
        No articles yet — words are brewing.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article, i) => (
        <SpotlightCard key={article.guid} href={article.link} index={i}>
          <span className="font-mono text-xs text-(--muted)">
            {formatDate(article.pubDate)}
          </span>
          <h3 className="mt-3 line-clamp-2 text-lg font-semibold tracking-tight transition-colors group-hover:text-(--color-accent)">
            {article.title}
          </h3>
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-(--muted)">
            {article.description || "Read on Zenn."}
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-(--color-accent)">
            Read on Zenn
            <span className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </span>
        </SpotlightCard>
      ))}
    </div>
  );
}
