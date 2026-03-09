import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  details: text("details"),
  dueDate: timestamp("due_date"),
  priority: text("priority").notNull().default('Normal'),
  status: text("status").notNull().default('Pending'),
  totalMinutesSpent: integer("total_minutes_spent").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const timeLogs = pgTable("time_logs", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull(),
  userId: varchar("user_id").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  isManual: boolean("is_manual").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  userId: true,
  totalMinutesSpent: true,
  createdAt: true,
});
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTaskRequest = Partial<InsertTask> & { status?: string, totalMinutesSpent?: number };
export type Task = typeof tasks.$inferSelect;

export const insertTimeLogSchema = createInsertSchema(timeLogs).omit({
  id: true,
  userId: true,
});
export type InsertTimeLog = z.infer<typeof insertTimeLogSchema>;
export type TimeLog = typeof timeLogs.$inferSelect;
