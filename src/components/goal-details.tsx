import { useState } from "react";
import { Goal } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGoals } from "@/lib/context/goal-context";
import { ProgressForm } from "./progress-form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface GoalDetailsProps {
  goal: Goal;
  onBack: () => void;
}

export function GoalDetails({ goal, onBack }: GoalDetailsProps) {
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);
  const { getProgressForGoal, logProgress, deleteProgressEntry, calculateActualProgress, calculatePlannedProgress, calculateDelay } = useGoals();

  const progressEntries = getProgressForGoal(goal.id);
  const actualProgress = calculateActualProgress(goal.id);
  const plannedProgress = calculatePlannedProgress(goal);
  const delay = calculateDelay(goal);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (window.confirm("Are you sure you want to delete this progress entry?")) {
      await deleteProgressEntry(entryId);
    }
  };

  const calculateProgressPercentage = () => {
    return Math.min(Math.round((actualProgress / goal.totalRequiredTime) * 100), 100);
  };

  const calculatePlannedPercentage = () => {
    return Math.min(Math.round((plannedProgress / goal.totalRequiredTime) * 100), 100);
  };

  const getStatusColor = () => {
    const actualPercentage = calculateProgressPercentage();
    const plannedPercentage = calculatePlannedPercentage();

    if (actualPercentage >= plannedPercentage) {
      return "bg-green-500"; // On track or ahead
    } else if (plannedPercentage - actualPercentage < 10) {
      return "bg-yellow-500"; // Slightly behind
    } else {
      return "bg-red-500"; // Significantly behind
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          Back to Goals
        </Button>

        <Dialog open={isProgressDialogOpen} onOpenChange={setIsProgressDialogOpen}>
          <DialogTrigger asChild>
            <Button>Log Progress</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Log Progress</DialogTitle>
              <DialogDescription>Record your progress for {goal.title}</DialogDescription>
            </DialogHeader>
            <ProgressForm
              goal={goal}
              onSubmit={async (data) => {
                await logProgress(data);
                setIsProgressDialogOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{goal.title}</CardTitle>
          <CardDescription>Deadline: {formatDate(goal.deadline)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {goal.description && (
            <div>
              <h3 className="text-lg font-medium">Description</h3>
              <p className="text-gray-600 dark:text-gray-400">{goal.description}</p>
            </div>
          )}

          <div>
            <h3 className="text-lg font-medium mb-2">Progress Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Required</p>
                    <p className="text-2xl font-bold">{goal.totalRequiredTime} hours</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                    <p className="text-2xl font-bold">{actualProgress} hours</p>
                    <p className="text-sm">{calculateProgressPercentage()}%</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Planned Progress</p>
                    <p className="text-2xl font-bold">{plannedProgress.toFixed(1)} hours</p>
                    <p className="text-sm">{calculatePlannedPercentage()}%</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{calculateProgressPercentage()}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className={`h-2.5 rounded-full ${getStatusColor()}`} style={{ width: `${calculateProgressPercentage()}%` }}></div>
              </div>
            </div>

            {delay > 0 && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-md">
                <p className="text-red-600 dark:text-red-400">You're behind schedule by approximately {delay.toFixed(1)} hours.</p>
              </div>
            )}

            {(goal.dailyTimeAllotment || goal.weeklyTimeAllotment || goal.monthlyTimeAllotment) && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Time Allotments</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {goal.dailyTimeAllotment ? (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-700">
                      <p className="font-medium">Daily Goal</p>
                      <p className="text-gray-700 dark:text-gray-300">{goal.dailyTimeAllotment} hours</p>
                    </div>
                  ) : null}
                  {goal.weeklyTimeAllotment ? (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-700">
                      <p className="font-medium">Weekly Goal</p>
                      <p className="text-gray-700 dark:text-gray-300">{goal.weeklyTimeAllotment} hours</p>
                    </div>
                  ) : null}
                  {goal.monthlyTimeAllotment ? (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-700">
                      <p className="font-medium">Monthly Goal</p>
                      <p className="text-gray-700 dark:text-gray-300">{goal.monthlyTimeAllotment} hours</p>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Progress History</h3>
            {progressEntries.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No progress entries yet.</p>
            ) : (
              <div className="space-y-2">
                {progressEntries
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((entry) => (
                    <div key={entry.id} className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-md flex justify-between items-center">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{entry.timeSpent} hours</span>
                          <span className="text-gray-500 dark:text-gray-400 text-sm">on {formatDate(entry.date)}</span>
                        </div>
                        {entry.notes && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{entry.notes}</p>}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
