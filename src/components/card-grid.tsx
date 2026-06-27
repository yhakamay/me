import type { ReactNode } from "react";

type CardGridProps<T> = {
  items: T[];
  /** Message shown when there are no items. */
  empty: string;
  children: (item: T, index: number) => ReactNode;
};

/**
 * Responsive card grid shared by the Work and Writing sections. Renders
 * the empty-state message when there's nothing to show, otherwise lays
 * the items out via the render-prop child.
 */
export function CardGrid<T>({ items, empty, children }: CardGridProps<T>) {
  if (items.length === 0) {
    return <p className="text-sm text-(--muted)">{empty}</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(children)}
    </div>
  );
}
