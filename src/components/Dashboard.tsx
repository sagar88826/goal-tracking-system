import { useState, useEffect } from "react";
import { Goal, CreateGoalFormData } from "@/lib/types";
import { useGoals } from "@/lib/context/GoalContext";
import { GoalForm } from "./GoalForm";
import { GoalList } from "./GoalList";
import { GoalDetails } from "./GoalDetails";
import { Analytics } from "./Analytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { checkForReminders } from "@/lib/services/notificationService";
import Settings from "./Settings";
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-center">Goal Tracking System</h1>
        <ModeToggle />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="goals">My Goals</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            {selectedGoal && <TabsTrigger value="details">Goal Details</TabsTrigger>}
          </TabsList>

          {activeTab === "goals" && (
            <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger asChild>
                <Button>Create New Goal</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{isEditing ? "Edit Goal" : "Create New Goal"}</DialogTitle>
                  <DialogDescription>{isEditing ? "Update your goal details below." : "Fill in the details below to create a new goal."}</DialogDescription>
                </DialogHeader>
                <GoalForm onSubmit={isEditing ? handleUpdateGoal : handleCreateGoal} initialData={selectedGoal || undefined} isEditing={isEditing} />
              </DialogContent>
            </Dialog>
          )}
        </div>

        <TabsContent value="goals" className="mt-6">
          <GoalList goals={goals} onEdit={handleEditGoal} onDelete={handleDeleteGoal} onViewDetails={handleViewGoalDetails} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Analytics />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Settings />
        </TabsContent>

        <TabsContent value="details" className="mt-6">
          {selectedGoal && <GoalDetails goal={selectedGoal} onBack={handleBackToGoals} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
