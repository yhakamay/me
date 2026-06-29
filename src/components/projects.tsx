import Link from "next/link";

import { CardGrid } from "@/components/card-grid";
import { formatDate } from "@/lib/format";
import { Repo } from "@/types/repo";

export function Projects({ repos }: { repos: Repo[] }) {
  return (
    <CardGrid
      items={repos}
      empty="Repositories are taking a break — check back soon."
    >
      {(repo) => (
        <li key={repo.id} className="border-b border-(--rule) last:border-0">
          <Link
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-baseline justify-between gap-6 py-4"
          >
            <span className="min-w-0">
              <span className="block text-lg font-medium leading-snug group-hover:italic">
                {repo.name}
              </span>
              <span className="mt-0.5 block truncate text-sm leading-snug text-(--muted)">
                {repo.description ?? "No description provided."}
              </span>
            </span>
            <span className="shrink-0 whitespace-nowrap text-right text-xs text-(--muted)">
              {repo.recent && <em>recently updated · </em>}
              {repo.language && `${repo.language} · `}
              {formatDate(repo.updated_at)}
            </span>
          </Link>
        </li>
      )}
    </CardGrid>
  );
}
