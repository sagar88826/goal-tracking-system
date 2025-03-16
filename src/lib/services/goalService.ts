import { v4 as uuidv4 } from "uuid";
import { Goal, CreateGoalFormData, ProgressEntry, LogProgressFormData } from "../types";

// For now, we'll use localStorage to store goals and progress
// In a real application, this would be replaced with API calls

const GOALS_STORAGE_KEY = "gts_goals";
const PROGRESS_STORAGE_KEY = "gts_progress";

// Helper functions to interact with localStorage
const getStoredGoals = (): Goal[] => {
  const storedGoals = localStorage.getItem(GOALS_STORAGE_KEY);
  if (!storedGoals) return [];

  try {
    // Parse dates from JSON
    return JSON.parse(storedGoals, (key, value) => {
      if (key === "deadline" || key === "createdAt" || key === "updatedAt") {
        return new Date(value);
      }
      return value;
    });
  } catch (error) {
    console.error("Error parsing goals from localStorage:", error);
    return [];
  }
};

const saveGoals = (goals: Goal[]): void => {
  localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
};

const getStoredProgress = (): ProgressEntry[] => {
  const storedProgress = localStorage.getItem(PROGRESS_STORAGE_KEY);
  if (!storedProgress) return [];

  try {
    // Parse dates from JSON
    return JSON.parse(storedProgress, (key, value) => {
      if (key === "date") {
        return new Date(value);
      }
      return value;
    });
  } catch (error) {
    console.error("Error parsing progress from localStorage:", error);
    return [];
  }
};

const saveProgress = (progress: ProgressEntry[]): void => {
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
};

// Goal CRUD operations
export const getAllGoals = (): Goal[] => {
  return getStoredGoals();
};

export const getGoalById = (id: string): Goal | undefined => {
  const goals = getStoredGoals();
  return goals.find((goal) => goal.id === id);
};

export const createGoal = (goalData: CreateGoalFormData): Goal => {
  const goals = getStoredGoals();
  const now = new Date();

  const newGoal: Goal = {
    ...goalData,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };

  goals.push(newGoal);
  saveGoals(goals);

  return newGoal;
};

export const updateGoal = (id: string, goalData: Partial<CreateGoalFormData>): Goal | undefined => {
  const goals = getStoredGoals();
  const goalIndex = goals.findIndex((goal) => goal.id === id);

  if (goalIndex === -1) return undefined;

  const updatedGoal: Goal = {
    ...goals[goalIndex],
    ...goalData,
    updatedAt: new Date(),
  };

  goals[goalIndex] = updatedGoal;
  saveGoals(goals);

  return updatedGoal;
};

export const deleteGoal = (id: string): boolean => {
  const goals = getStoredGoals();
  const filteredGoals = goals.filter((goal) => goal.id !== id);

  if (filteredGoals.length === goals.length) return false;

  saveGoals(filteredGoals);

  // Also delete associated progress entries
  const progress = getStoredProgress();
  const filteredProgress = progress.filter((entry) => entry.goalId !== id);
  saveProgress(filteredProgress);

  return true;
};

// Progress tracking operations
export const getProgressForGoal = (goalId: string): ProgressEntry[] => {
  const progress = getStoredProgress();
  return progress.filter((entry) => entry.goalId === goalId);
};

export const logProgress = (progressData: LogProgressFormData): ProgressEntry => {
  const progress = getStoredProgress();

  const newEntry: ProgressEntry = {
    ...progressData,
    id: uuidv4(),
  };

  progress.push(newEntry);
  saveProgress(progress);

  return newEntry;
};

export const deleteProgressEntry = (id: string): boolean => {
  const progress = getStoredProgress();
  const filteredProgress = progress.filter((entry) => entry.id !== id);

  if (filteredProgress.length === progress.length) return false;

  saveProgress(filteredProgress);
  return true;
};

// Progress calculation functions
export const calculatePlannedProgress = (goal: Goal, currentDate: Date = new Date()): number => {
  const totalDays = Math.ceil((goal.deadline.getTime() - goal.createdAt.getTime()) / (1000 * 60 * 60 * 24));
  const daysPassed = Math.ceil((currentDate.getTime() - goal.createdAt.getTime()) / (1000 * 60 * 60 * 24));

  // Ensure we don't exceed 100% or go below 0%
  const progressPercentage = Math.min(Math.max(daysPassed / totalDays, 0), 1);

  return goal.totalRequiredTime * progressPercentage;
};

export const calculateActualProgress = (goalId: string): number => {
  const progress = getProgressForGoal(goalId);
  return progress.reduce((total, entry) => total + entry.timeSpent, 0);
};

export const calculateDelay = (goal: Goal): number => {
  const plannedProgress = calculatePlannedProgress(goal);
  const actualProgress = calculateActualProgress(goal.id);

  return Math.max(0, plannedProgress - actualProgress);
};
