import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { boolean } from "drizzle-orm/pg-core";

export const books = pgTable("books", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  size: text("size").notNull(),
  date: text("date").notNull(),
  cover: text("cover"), // Base64
  pdfData: text("pdf_data"), // Base64
  isPublic: boolean("is_public").default(false).notNull(),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  userId: text("user_id").default("guest").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const aiMessages = pgTable("ai_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  lang: text("lang").default("ar").notNull(),
  theme: text("theme").default("dark").notNull(),
  accent: text("accent").default("#00e5ff").notNull(),
  density: text("density").default("comfortable").notNull(),
  radius: text("radius").default("rounded").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});