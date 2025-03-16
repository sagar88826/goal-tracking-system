import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Goal, ProgressEntry, CreateGoalFormData, LogProgressFormData } from "../types";
import * as goalService from "../services/goalService";

interface GoalContextType {
  goals: Goal[];
  loading: boolean;
  error: string | null;
  createGoal: (goalData: CreateGoalFormData) => Promise<Goal>;
  updateGoal: (id: string, goalData: Partial<CreateGoalFormData>) => Promise<Goal | undefined>;
  deleteGoal: (id: string) => Promise<boolean>;
  getGoalById: (id: string) => Goal | undefined;
  getProgressForGoal: (goalId: string) => ProgressEntry[];
  logProgress: (progressData: LogProgressFormData) => Promise<ProgressEntry>;
  deleteProgressEntry: (id: string) => Promise<boolean>;
  calculatePlannedProgress: (goal: Goal) => number;
  calculateActualProgress: (goalId: string) => number;
  calculateDelay: (goal: Goal) => number;
  refreshGoals: () => void;
}

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export const useGoals = () => {
  const context = useContext(GoalContext);
  if (context === undefined) {
    throw new Error("useGoals must be used within a GoalProvider");
  }
  return context;
};

interface GoalProviderProps {
  children: ReactNode;
}

export const GoalProvider = ({ children }: GoalProviderProps) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to refresh goals from localStorage
  const refreshGoals = () => {
    try {
      const storedGoals = goalService.getAllGoals();
      setGoals(storedGoals);
      setError(null);
    } catch (error) {
      console.error("Failed to refresh goals:", error);
      setError("Failed to refresh goals");
    }
  };

  // Load goals from localStorage on initial render
  useEffect(() => {
    try {
      const storedGoals = goalService.getAllGoals();
      setGoals(storedGoals);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load goals:", error);
      setError("Failed to load goals");
      setLoading(false);
    }
  }, []);

  // Wrap service functions to update state and handle errors
  const createGoal = async (goalData: CreateGoalFormData): Promise<Goal> => {
    try {
      const newGoal = goalService.createGoal(goalData);
      setGoals((prevGoals) => [...prevGoals, newGoal]);
      return newGoal;
    } catch (err) {
      setError("Failed to create goal");
      throw err;
    }
  };

  const updateGoal = async (id: string, goalData: Partial<CreateGoalFormData>): Promise<Goal | undefined> => {
    try {
      const updatedGoal = goalService.updateGoal(id, goalData);
      if (updatedGoal) {
        setGoals((prevGoals) => prevGoals.map((goal) => (goal.id === id ? updatedGoal : goal)));
      }
      return updatedGoal;
    } catch (err) {
      setError("Failed to update goal");
      throw err;
    }
  };

  const deleteGoal = async (id: string): Promise<boolean> => {
    try {
      const success = goalService.deleteGoal(id);
      if (success) {
        setGoals((prevGoals) => prevGoals.filter((goal) => goal.id !== id));
      }
      return success;
    } catch (err) {
      setError("Failed to delete goal");
      throw err;
    }
  };

  const logProgress = async (progressData: LogProgressFormData): Promise<ProgressEntry> => {
    try {
      return goalService.logProgress(progressData);
    } catch (err) {
      setError("Failed to log progress");
      throw err;
    }
  };

  const deleteProgressEntry = async (id: string): Promise<boolean> => {
    try {
      return goalService.deleteProgressEntry(id);
    } catch (err) {
      setError("Failed to delete progress entry");
      throw err;
    }
  };

  const value: GoalContextType = {
    goals,
    loading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    getGoalById: goalService.getGoalById,
    getProgressForGoal: goalService.getProgressForGoal,
    logProgress,
    deleteProgressEntry,
    calculatePlannedProgress: goalService.calculatePlannedProgress,
    calculateActualProgress: goalService.calculateActualProgress,
    calculateDelay: goalService.calculateDelay,
    refreshGoals,
  };

  return <GoalContext.Provider value={value}>{children}</GoalContext.Provider>;
};
