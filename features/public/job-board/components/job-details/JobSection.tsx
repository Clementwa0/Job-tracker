import type { ReactNode } from "react";

export function JobSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8 border-t pt-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-3 text-sm leading-7 text-muted-foreground">{children}</div>
    </section>
  );
}
