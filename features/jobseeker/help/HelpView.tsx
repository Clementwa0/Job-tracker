"use client";

import { useMemo, useState } from "react";
import { HelpCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FAQ_CATEGORIES } from "@/features/jobseeker/help/faqData";

export default function HelpView() {
  const [query, setQuery] = useState("");

  const categories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQ_CATEGORIES;

    return FAQ_CATEGORIES.map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q),
      ),
    })).filter((category) => category.items.length > 0);
  }, [query]);

  const totalResults = categories.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <h1 className="font-display text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          Help &amp; Support
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Answers to common questions about applications, interviews, resumes, and your account.
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search help articles…"
          className="pl-9"
        />
      </div>

      {query.trim() && (
        <p className="text-xs text-muted-foreground">
          {totalResults} {totalResults === 1 ? "result" : "results"} for &ldquo;{query.trim()}&rdquo;
        </p>
      )}

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-14 text-center">
          <HelpCircle className="h-8 w-8 text-muted-foreground/60" />
          <p className="text-sm font-medium">No articles match your search</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            Try a different term, or browse the categories below once you clear your search.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => (
            <Card key={category.id} className="shadow-none">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">{category.title}</CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-border">
                {category.items.map((item) => (
                  <details key={item.question} className="group py-2.5 first:pt-0 last:pb-0">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-foreground marker:content-none">
                      {item.question}
                      <span
                        aria-hidden
                        className="shrink-0 text-muted-foreground transition-transform group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
                  </details>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
