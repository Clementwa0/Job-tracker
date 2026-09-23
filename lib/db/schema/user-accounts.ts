import { pgTable, text, unique, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "./_helpers";
import { authProviderEnum } from "./enums";
import { users } from "./users";

/**
 * A linked external-identity-provider account for a user — e.g. the Google
 * account behind a Google SSO sign-in. Kept separate from `users` (rather
 * than putting `googleId` directly on the user row) so another provider can
 * be linked later without changing the `users` table, and so this table can
 * be extended with provider tokens if a provider ever needs them.
 *
 * There is no email/password row here: admin auth is a wholly separate
 * system and never has a `user_accounts` row.
 */
export const userAccounts = pgTable(
  "user_accounts",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    provider: authProviderEnum("provider").notNull(),
    // The provider's own identifier for this identity (Google's "sub"/id).
    providerAccountId: text("provider_account_id").notNull(),

    ...timestamps(),
  },
  (table) => [
    // The same external identity can't be linked to two different users.
    unique("user_accounts_provider_account_unique").on(
      table.provider,
      table.providerAccountId,
    ),
    // One account per provider per user (e.g. only one linked Google
    // identity per user).
    unique("user_accounts_user_provider_unique").on(
      table.userId,
      table.provider,
    ),
  ],
);

export type UserAccount = typeof userAccounts.$inferSelect;
export type NewUserAccount = typeof userAccounts.$inferInsert;
