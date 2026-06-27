import Link from "next/link";

import { site } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-(--border) py-12">
      <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="text-center sm:text-left">
          <p className="text-sm font-medium">{site.name}</p>
          <p className="mt-1 text-xs text-(--muted)">
            &copy; {year} · Built with Next.js & Tailwind CSS
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-(--muted)">
          {site.socials.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-(--fg)"
            >
              {s.label}
            </Link>
          ))}
          <Link
            href="https://github.com/yhakamay/me"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-(--fg)"
          >
            Source
          </Link>
        </div>
      </div>
    </footer>
  );
}
