import { CardGrid } from "@/components/card-grid";
import { SpotlightCard } from "@/components/spotlight-card";
import { formatDate } from "@/lib/format";
import { Repo } from "@/types/repo";

export function Projects({ repos }: { repos: Repo[] }) {
  return (
    <CardGrid
      items={repos}
      empty="Repositories are taking a break — check back soon."
    >
      {(repo, i) => (
        <SpotlightCard key={repo.id} href={repo.html_url} index={i}>
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-xs text-(--muted)">
              {formatDate(repo.updated_at)}
            </span>
            {repo.recent && (
              <span className="rounded-full bg-(--color-accent)/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-(--color-accent)">
                Recent
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold tracking-tight transition-colors group-hover:text-(--color-accent)">
            {repo.name}
          </h3>
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-(--muted)">
            {repo.description ?? "No description provided."}
          </p>
          <div className="mt-4 flex items-center gap-4 text-xs text-(--muted)">
            {repo.language && (
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-(--color-accent-2)" />
                {repo.language}
              </span>
            )}
            {repo.stargazers_count > 0 && <span>★ {repo.stargazers_count}</span>}
            {repo.forks_count > 0 && <span>⑂ {repo.forks_count}</span>}
          </div>
        </SpotlightCard>
      )}
    </CardGrid>
  );
}
