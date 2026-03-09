import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { setupAuth } from "./auth";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);

  // Apply authentication middleware to all API routes except auth
  app.use('/api', (req, res, next) => {
    if (req.path.startsWith('/auth') || req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  });

  app.get(api.tasks.list.path, async (req, res) => {
    const tasks = await storage.getTasks(req.user!.id);
    res.json(tasks);
  });

  app.get(api.tasks.get.path, async (req, res) => {
    const task = await storage.getTask(Number(req.params.id));
    if (!task || task.userId !== req.user!.id) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  });

  app.post(api.tasks.create.path, async (req, res) => {
    try {
      const input = api.tasks.create.input.parse(req.body);
      const task = await storage.createTask(req.user!.id, input);
      res.status(201).json(task);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.tasks.update.path, async (req, res) => {
    try {
      const input = api.tasks.update.input.parse(req.body);
      const existingTask = await storage.getTask(Number(req.params.id));
      if (!existingTask || existingTask.userId !== req.user!.id) {
         return res.status(404).json({ message: 'Task not found' });
      }
      const task = await storage.updateTask(Number(req.params.id), input);
      res.json(task);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.tasks.delete.path, async (req, res) => {
    const existingTask = await storage.getTask(Number(req.params.id));
    if (!existingTask || existingTask.userId !== req.user!.id) {
       return res.status(404).json({ message: 'Task not found' });
    }
    await storage.deleteTask(Number(req.params.id));
    res.status(204).send();
  });

  app.get(api.timeLogs.list.path, async (req, res) => {
    const existingTask = await storage.getTask(Number(req.params.taskId));
    if (!existingTask || existingTask.userId !== req.user!.id) {
       return res.status(404).json({ message: 'Task not found' });
    }
    const logs = await storage.getTimeLogs(Number(req.params.taskId));
    res.json(logs);
  });

  app.post(api.timeLogs.create.path, async (req, res) => {
    try {
      const existingTask = await storage.getTask(Number(req.params.taskId));
      if (!existingTask || existingTask.userId !== req.user!.id) {
         return res.status(404).json({ message: 'Task not found' });
      }
      const bodySchema = api.timeLogs.create.input.extend({
        durationMinutes: z.coerce.number()
      });
      const input = bodySchema.parse(req.body);
      
      const log = await storage.createTimeLog({
        taskId: Number(req.params.taskId),
        userId: req.user!.id,
        startTime: new Date(input.startTime),
        endTime: new Date(input.endTime),
        durationMinutes: input.durationMinutes,
        isManual: input.isManual || false
      });
      res.status(201).json(log);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  return httpServer;
}
