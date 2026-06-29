import type { ReactNode } from "react";

type CardGridProps<T> = {
  items: T[];
  /** Message shown when there are no items. */
  empty: string;
  children: (item: T, index: number) => ReactNode;
};

/**
 * Hairline-ruled list shared by the Work and Writing sections. Renders
 * the empty-state message when there's nothing to show, otherwise lays
 * the items out as ruled rows via the render-prop child (each child
 * returns an `<li>`).
 */
export function CardGrid<T>({ items, empty, children }: CardGridProps<T>) {
  if (items.length === 0) {
    return <p className="text-sm text-(--muted)">{empty}</p>;
  }

  return <ul className="border-t border-(--rule)">{items.map(children)}</ul>;
}
