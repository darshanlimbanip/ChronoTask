import { db } from "./db";
import { eq } from "drizzle-orm";
import {
  users, tasks, timeLogs,
  type User, type InsertUser,
  type Task, type InsertTask, type UpdateTaskRequest,
  type TimeLog, type InsertTimeLog
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresStore = connectPg(session);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getTasks(userId: string): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(userId: string, task: InsertTask): Promise<Task>;
  updateTask(id: number, task: UpdateTaskRequest): Promise<Task>;
  deleteTask(id: number): Promise<void>;

  getTimeLogs(taskId: number): Promise<TimeLog[]>;
  createTimeLog(log: InsertTimeLog): Promise<TimeLog>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getTasks(userId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.userId, userId));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(userId: string, insertTask: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values({ ...insertTask, userId }).returning();
    return task;
  }

  async updateTask(id: number, update: UpdateTaskRequest): Promise<Task> {
    const [task] = await db.update(tasks).set(update).where(eq(tasks.id, id)).returning();
    return task;
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async getTimeLogs(taskId: number): Promise<TimeLog[]> {
    return await db.select().from(timeLogs).where(eq(timeLogs.taskId, taskId));
  }

  async createTimeLog(insertLog: InsertTimeLog): Promise<TimeLog> {
    const [log] = await db.insert(timeLogs).values(insertLog).returning();
    
    // Also update task total minutes spent
    const task = await this.getTask(log.taskId);
    if (task) {
      await this.updateTask(task.id, { 
        totalMinutesSpent: task.totalMinutesSpent + log.durationMinutes 
      });
    }

    return log;
  }
}

export const storage = new DatabaseStorage();
