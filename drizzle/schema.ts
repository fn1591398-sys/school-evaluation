import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * المجالات الأربعة للتقويم الذاتي
 */
export const domains = mysqlTable("domains", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 10 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  orderIndex: int("orderIndex").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Domain = typeof domains.$inferSelect;
export type InsertDomain = typeof domains.$inferInsert;

/**
 * المعايير تحت كل مجال
 */
export const criteria = mysqlTable("criteria", {
  id: int("id").autoincrement().primaryKey(),
  domainId: int("domainId").notNull(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  orderIndex: int("orderIndex").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Criteria = typeof criteria.$inferSelect;
export type InsertCriteria = typeof criteria.$inferInsert;

/**
 * المؤشرات تحت كل معيار
 */
export const indicators = mysqlTable("indicators", {
  id: int("id").autoincrement().primaryKey(),
  criteriaId: int("criteriaId").notNull(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  text: text("text").notNull(),
  orderIndex: int("orderIndex").notNull().default(0),
  isPrivate: int("isPrivate").notNull().default(0), // 1 = للمدارس الأهلية فقط
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Indicator = typeof indicators.$inferSelect;
export type InsertIndicator = typeof indicators.$inferInsert;

/**
 * الشواهد المرفوعة لكل مؤشر
 */
export const evidences = mysqlTable("evidences", {
  id: int("id").autoincrement().primaryKey(),
  indicatorId: int("indicatorId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileType: varchar("fileType", { length: 100 }).notNull(),
  fileSize: int("fileSize").notNull().default(0),
  uploadedBy: varchar("uploadedBy", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Evidence = typeof evidences.$inferSelect;
export type InsertEvidence = typeof evidences.$inferInsert;
