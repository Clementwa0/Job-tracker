import { sql } from "drizzle-orm";
import { index, jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "./_helpers";
import { users } from "./users";

/**
 * Resume-builder documents. The section bodies are free-form, editor-owned
 * structures (see types/resume-builder.ts), so they're stored as JSONB
 * rather than being modelled column-by-column.
 */
export const resumes = pgTable(
  "resumes",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    title: text("title").notNull().default("Untitled resume"),
    template: text("template").notNull().default("modern"),
    accent: text("accent").notNull().default("#2563eb"),

    contact: jsonb("contact")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    summary: text("summary").notNull().default(""),

    experience: jsonb("experience").$type<unknown[]>().notNull().default(sql`'[]'::jsonb`),
    education: jsonb("education").$type<unknown[]>().notNull().default(sql`'[]'::jsonb`),
    projects: jsonb("projects").$type<unknown[]>().notNull().default(sql`'[]'::jsonb`),
    skills: jsonb("skills").$type<unknown[]>().notNull().default(sql`'[]'::jsonb`),
    certifications: jsonb("certifications").$type<unknown[]>().notNull().default(sql`'[]'::jsonb`),
    languages: jsonb("languages").$type<unknown[]>().notNull().default(sql`'[]'::jsonb`),

    ...timestamps(),
  },
  (table) => [index("resumes_user_id_idx").on(table.userId)],
);

export type Resume = typeof resumes.$inferSelect;
export type NewResume = typeof resumes.$inferInsert;
