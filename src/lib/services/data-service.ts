import { getAllGoals as getGoals } from "@/lib/services/goal-service";
import { toast } from "@/lib/hooks/use-toast";

// Define a type for the imported goal data
interface ImportedGoal {
  id: string;
  title: string;
  description?: string;
  totalRequiredTime: number;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  dailyTimeAllotment?: number;
  weeklyTimeAllotment?: number;
  monthlyTimeAllotment?: number;
}

// Define a type for the imported progress entry
interface ImportedProgressEntry {
  id: string;
  goalId: string;
  timeSpent: number;
  date: string;
  notes?: string;
}

// Define the storage keys to match those in goalService.ts
const GOALS_STORAGE_KEY = "gts_goals";
const PROGRESS_STORAGE_KEY = "gts_progress";

/**
 * Exports all user data as a JSON file for download
 */
export const exportUserData = () => {
  try {
    // Get all goals from local storage
    const goals = getGoals();

    // Get all progress entries from local storage
    let progress = [];
    try {
      const progressData = localStorage.getItem("gts_progress");
      if (progressData) {
        progress = JSON.parse(progressData);
      }
    } catch (error) {
      console.error("Error parsing progress data:", error);
      // Continue with empty progress array
    }

    // Create a data object with all user data
    const userData = {
      goals,
      progress,
      exportDate: new Date().toISOString(),
      version: "1.0.0",
    };

    // Convert to JSON string
    const jsonData = JSON.stringify(userData, null, 2);

    // Create a blob with the data
    const blob = new Blob([jsonData], { type: "application/json" });

    // Create a URL for the blob
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element to trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = `goal-tracker-backup-${new Date().toLocaleDateString().replace(/\//g, "-")}.json`;

    // Append to body, click to download, then remove
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Your data has been exported successfully.",
      variant: "default",
    });

    return true;
  } catch (error) {
    console.error("Error exporting user data:", error);

    toast({
      title: "Export Failed",
      description: "There was an error exporting your data. Please try again.",
      variant: "destructive",
    });

    return false;
  }
};

/**
 * Imports user data from a JSON file
 * @param file The JSON file to import
 * @param overwriteExisting Whether to overwrite existing data or merge with it
 * @returns Promise that resolves to true if import was successful, false otherwise
 */
export const importUserData = (file: File, overwriteExisting: boolean = false): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          if (!event.target || typeof event.target.result !== "string") {
            throw new Error("Failed to read file");
          }

          // Parse the JSON data
          const userData = JSON.parse(event.target.result);

          // Validate the data structure
          if (!userData.goals || !Array.isArray(userData.goals)) {
            throw new Error("Invalid data format: goals array is missing");
          }

          // Convert date strings back to Date objects for goals
          const processedGoals = userData.goals.map((goal: ImportedGoal) => ({
            ...goal,
            deadline: new Date(goal.deadline),
            createdAt: new Date(goal.createdAt),
            updatedAt: new Date(goal.updatedAt),
          }));

          // Store the data in localStorage
          if (overwriteExisting) {
            // Clear existing data
            localStorage.removeItem(GOALS_STORAGE_KEY);
            localStorage.removeItem(PROGRESS_STORAGE_KEY);
          }

          // Save the imported goals
          localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(processedGoals));

          // Check if progress data exists in the imported file
          if (userData.progress && Array.isArray(userData.progress)) {
            // Process progress entries (convert dates)
            const processedProgress = userData.progress.map((entry: ImportedProgressEntry) => ({
              ...entry,
              date: new Date(entry.date),
            }));

            if (overwriteExisting) {
              // Replace all progress data
              localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(processedProgress));
            } else {
              // Merge with existing progress data
              try {
                const existingProgress = JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) || "[]");
                const mergedProgress = [...existingProgress, ...processedProgress];
                localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(mergedProgress));
              } catch (error) {
                console.error("Error merging progress data:", error);
                // If there's an error, just use the imported progress
                localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(processedProgress));
              }
            }
          }

          toast({
            title: "Import Successful",
            description: "Your data has been imported successfully. The page will refresh to show your imported data.",
            variant: "default",
          });

          // Add a small delay before refreshing to allow the toast to be seen
          setTimeout(() => {
            window.location.reload();
          }, 1500);

          resolve(true);
        } catch (error) {
          console.error("Error processing imported data:", error);

          toast({
            title: "Import Failed",
            description: "The selected file contains invalid data. Please try again with a valid export file.",
            variant: "destructive",
          });

          resolve(false);
        }
      };

      reader.onerror = () => {
        toast({
          title: "Import Failed",
          description: "Failed to read the selected file. Please try again.",
          variant: "destructive",
        });

        resolve(false);
      };

      // Read the file as text
      reader.readAsText(file);
    } catch (error) {
      console.error("Error importing user data:", error);

      toast({
        title: "Import Failed",
        description: "There was an error importing your data. Please try again.",
        variant: "destructive",
      });

      resolve(false);
    }
  });
};

/**
 * Clears all user data from local storage
 */
export const clearUserData = () => {
  try {
    // Clear all goals
    localStorage.removeItem(GOALS_STORAGE_KEY);

    // Clear all progress data
    localStorage.removeItem(PROGRESS_STORAGE_KEY);

    // Clear notification settings
    localStorage.removeItem("notification_settings");

    toast({
      title: "Data Cleared",
      description: "All your data has been cleared successfully. The page will refresh.",
      variant: "default",
    });

    // Add a small delay before refreshing to allow the toast to be seen
    setTimeout(() => {
      window.location.reload();
    }, 1500);

    return true;
  } catch (error) {
    console.error("Error clearing user data:", error);

    toast({
      title: "Operation Failed",
      description: "There was an error clearing your data. Please try again.",
      variant: "destructive",
    });

    return false;
  }
};
