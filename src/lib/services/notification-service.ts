import { Goal } from "../types";
import { toast } from "../hooks/use-toast";
import { calculateActualProgress, calculatePlannedProgress, getGoalById, getProgressForGoal } from "./goal-service";

// Constants for notification settings
const NOTIFICATION_STORAGE_KEY = "gts_notifications";
const DEFAULT_REMINDER_DAYS = 2; // Remind after 2 days of inactivity

// Interface for notification settings
interface NotificationSettings {
  enabled: boolean;
  reminderDays: number;
  lastNotificationDate: string | null;
}

// Get notification settings from localStorage
export const getNotificationSettings = (): NotificationSettings => {
  const storedSettings = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
  if (!storedSettings) {
    return {
      enabled: true, // Enabled by default
      reminderDays: DEFAULT_REMINDER_DAYS,
      lastNotificationDate: null,
    };
  }

  try {
    return JSON.parse(storedSettings);
  } catch (error) {
    console.error("Error parsing notification settings:", error);
    return {
      enabled: true,
      reminderDays: DEFAULT_REMINDER_DAYS,
      lastNotificationDate: null,
    };
  }
};

// Save notification settings to localStorage
export const saveNotificationSettings = (settings: NotificationSettings): void => {
  localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(settings));
};

// Update notification settings
export const updateNotificationSettings = (updates: Partial<NotificationSettings>): NotificationSettings => {
  const currentSettings = getNotificationSettings();
  const updatedSettings = { ...currentSettings, ...updates };
  saveNotificationSettings(updatedSettings);
  return updatedSettings;
};

// Check if we should show a reminder notification
export const checkForReminders = (goals: Goal[]): void => {
  const settings = getNotificationSettings();

  // If notifications are disabled, return
  if (!settings.enabled) return;

  // Check if we've already shown a notification today
  const today = new Date().toISOString().split("T")[0];
  if (settings.lastNotificationDate === today) return;

  // Find goals that need attention
  const goalsNeedingAttention = goals.filter((goal) => {
    const actual = calculateActualProgress(goal.id);
    const planned = calculatePlannedProgress(goal);

    // Goal is behind schedule
    return actual < planned;
  });

  // Find goals with no recent progress
  const goalsWithNoRecentProgress = goals.filter((goal) => {
    // Get the last progress entry date
    const lastProgressDate = getLastProgressDate(goal.id);
    if (!lastProgressDate) return true; // No progress logged yet

    // Calculate days since last progress
    const daysSinceLastProgress = getDaysSince(lastProgressDate);
    return daysSinceLastProgress >= settings.reminderDays;
  });

  // Show notifications
  if (goalsNeedingAttention.length > 0) {
    showBehindScheduleNotification(goalsNeedingAttention);
    updateNotificationSettings({ lastNotificationDate: today });
  } else if (goalsWithNoRecentProgress.length > 0) {
    showNoRecentProgressNotification(goalsWithNoRecentProgress);
    updateNotificationSettings({ lastNotificationDate: today });
  }
};

// Get the date of the last progress entry for a goal
const getLastProgressDate = (goalId: string): Date | null => {
  const goal = getGoalById(goalId);
  if (!goal) return null;

  // Get all progress entries for this goal
  const progressEntries = getProgressForGoal(goalId);

  // If no progress entries, return null
  if (progressEntries.length === 0) return null;

  // Sort entries by date (newest first) and return the date of the most recent entry
  const sortedEntries = [...progressEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return new Date(sortedEntries[0].date);
};

// Calculate days since a given date
const getDaysSince = (date: Date): number => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Show notification for goals behind schedule
const showBehindScheduleNotification = (goals: Goal[]): void => {
  const goalCount = goals.length;
  const goalNames = goals
    .slice(0, 2)
    .map((goal) => goal.title)
    .join(", ");
  const additionalGoals = goalCount > 2 ? ` and ${goalCount - 2} more` : "";

  toast({
    title: "Goals Need Attention",
    description: `${goalNames}${additionalGoals} ${goalCount === 1 ? "is" : "are"} behind schedule. Log your progress to stay on track!`,
    variant: "default",
  });
};

// Show notification for goals with no recent progress
const showNoRecentProgressNotification = (goals: Goal[]): void => {
  const goalCount = goals.length;
  const goalNames = goals
    .slice(0, 2)
    .map((goal) => goal.title)
    .join(", ");
  const additionalGoals = goalCount > 2 ? ` and ${goalCount - 2} more` : "";

  toast({
    title: "Time to Log Progress",
    description: `You haven't logged progress for ${goalNames}${additionalGoals} recently. Keep the momentum going!`,
    variant: "default",
  });
};
