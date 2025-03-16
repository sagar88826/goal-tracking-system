import { z } from "zod";

// Goal schema
export const goalSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  totalRequiredTime: z.number().positive("Time must be positive"),
  deadline: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
  // Optional breakdown of required effort
  dailyTimeAllotment: z.number().optional(),
  weeklyTimeAllotment: z.number().optional(),
  monthlyTimeAllotment: z.number().optional(),
});

export type Goal = z.infer<typeof goalSchema>;

// Progress entry schema
export const progressEntrySchema = z.object({
  id: z.string(),
  goalId: z.string(),
  timeSpent: z.number().positive("Time spent must be positive"),
  date: z.date(),
  notes: z.string().optional(),
});

export type ProgressEntry = z.infer<typeof progressEntrySchema>;

// Form schemas for creating/editing goals
export const createGoalSchema = goalSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateGoalFormData = z.infer<typeof createGoalSchema>;

// Form schema for logging progress
export const logProgressSchema = progressEntrySchema.omit({
  id: true,
});

export type LogProgressFormData = z.infer<typeof logProgressSchema>;
