import type { ReactNode } from "react";

import { Reveal } from "@/components/reveal";

type SectionProps = {
  id: string;
  index: string;
  title: string;
  children: ReactNode;
};

export function Section({ id, index, title, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-24 py-20 sm:py-28">
      <Reveal>
        <div className="mb-10 flex items-baseline gap-4">
          <span className="font-mono text-sm text-(--muted)">{index}</span>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h2>
          <span className="h-px flex-1 bg-(--border)" aria-hidden />
        </div>
      </Reveal>
      {children}
    </section>
  );
}
