import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Global user identity. `oidc_sub` is the verified `sub` claim from the OIDC
// provider; it is opaque, stable, and is the only thing we trust as identity.
// `preferred_username` (or the email local part) from the ID token is treated
// as a slug candidate at sign-in and is not stored here.
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  oidcSub: text("oidc_sub").notNull().unique(),
  createdAt: integer("created_at").notNull(),
});

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
