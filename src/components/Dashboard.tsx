import { useState, useEffect } from "react";
import { Goal, CreateGoalFormData } from "@/lib/types";
import { useGoals } from "@/lib/context/goal-context";
import { GoalForm } from "./goal-form";
import { GoalList } from "./goal-list";
import { GoalDetails } from "./goal-details";
import { Analytics } from "./analytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { checkForReminders } from "@/lib/services/notification-service";
import Settings from "./settings";
import { ModeToggle } from "./mode-toggle";

export function Dashboard() {
  const { goals, loading, error, createGoal, updateGoal, deleteGoal } = useGoals();
  const [activeTab, setActiveTab] = useState("goals");
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Check for reminders when the component mounts or goals change
  useEffect(() => {
    if (goals.length > 0) {
      checkForReminders(goals);
    }
  }, [goals]);

  const handleCreateGoal = async (data: CreateGoalFormData) => {
    await createGoal(data);
    setIsDialogOpen(false);
  };

  const handleUpdateGoal = async (data: CreateGoalFormData) => {
    if (selectedGoal) {
      await updateGoal(selectedGoal.id, data);
      setIsEditing(false);
      setSelectedGoal(null);
      setIsDialogOpen(false);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (window.confirm("Are you sure you want to delete this goal? This action cannot be undone.")) {
      await deleteGoal(goalId);
      if (selectedGoal?.id === goalId) {
        setSelectedGoal(null);
        setActiveTab("goals");
      }
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleViewGoalDetails = (goal: Goal) => {
    setSelectedGoal(goal);
    setActiveTab("details");
  };

  const handleBackToGoals = () => {
    setSelectedGoal(null);
    setIsEditing(false);
    setActiveTab("goals");
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      // Reset editing state when dialog is closed
      setIsEditing(false);
      setSelectedGoal(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8 max-w-full md:max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">Goal Tracking System</h1>
        <ModeToggle />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
          <TabsList className="w-full sm:w-auto overflow-x-auto">
            <TabsTrigger value="goals">My Goals</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            {selectedGoal && <TabsTrigger value="details">Goal Details</TabsTrigger>}
          </TabsList>

          {activeTab === "goals" && (
            <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">Create New Goal</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] w-[95vw] max-w-full">
                <DialogHeader>
                  <DialogTitle>{isEditing ? "Edit Goal" : "Create New Goal"}</DialogTitle>
                  <DialogDescription>
                    {isEditing ? "Update your goal details below." : "Fill in the details below to create a new goal."}
                  </DialogDescription>
                </DialogHeader>
                <GoalForm
                  onSubmit={isEditing ? handleUpdateGoal : handleCreateGoal}
                  initialData={selectedGoal || undefined}
                  isEditing={isEditing}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        <TabsContent value="goals" className="mt-4 sm:mt-6">
          <GoalList
            goals={goals}
            onEdit={handleEditGoal}
            onDelete={handleDeleteGoal}
            onViewDetails={handleViewGoalDetails}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-4 sm:mt-6">
          <Analytics />
        </TabsContent>

        <TabsContent value="settings" className="mt-4 sm:mt-6">
          <Settings />
        </TabsContent>

        <TabsContent value="details" className="mt-4 sm:mt-6">
          {selectedGoal && <GoalDetails goal={selectedGoal} onBack={handleBackToGoals} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
