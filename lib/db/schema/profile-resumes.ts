import { pgTable, uuid, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";

export const profileResumes = pgTable("profile_resumes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  publicId: text("public_id").notNull(),
  secureUrl: text("secure_url").notNull(),
  resourceType: text("resource_type").notNull(),
  format: text("format"),
  originalFilename: text("original_filename").notNull(),
  size: integer("size").notNull(),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("profile_resumes_user_id_idx").on(table.userId)]);
