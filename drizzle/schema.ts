import { int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 16 }).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const portfolioSettings = mysqlTable("portfolioSettings", {
  id: int("id").primaryKey(),
  cvUrl: text("cvUrl"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const portfolioProjects = mysqlTable("portfolioProjects", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  category: text("category"),
  context: text("context"),
  objective: text("objective"),
  audience: text("audience"),
  role: text("role"),
  tools: text("tools"),
  aiContribution: text("aiContribution"),
  editingDecisions: text("editingDecisions"),
  outcome: text("outcome"),
  videoUrl: text("videoUrl"),
  posterUrl: text("posterUrl"),
  aspectRatio: varchar("aspectRatio", { length: 40 }),
  duration: varchar("duration", { length: 40 }),
  captionUrl: text("captionUrl"),
  transcript: text("transcript"),
  featured: int("featured").default(0).notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  workType: varchar("workType", { length: 40 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const portfolioFiles = mysqlTable("portfolioFiles", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId"),
  kind: varchar("kind", { length: 32 }).notNull(),
  originalName: varchar("originalName", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 160 }).notNull(),
  sizeBytes: int("sizeBytes"),
  storageKey: text("storageKey").notNull(),
  storageUrl: text("storageUrl").notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type PortfolioSettings = typeof portfolioSettings.$inferSelect;
export type PortfolioProject = typeof portfolioProjects.$inferSelect;
export type InsertPortfolioProject = typeof portfolioProjects.$inferInsert;
export type PortfolioFile = typeof portfolioFiles.$inferSelect;
export type InsertPortfolioFile = typeof portfolioFiles.$inferInsert;
