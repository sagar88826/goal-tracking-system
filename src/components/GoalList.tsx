import { useState } from "react";
import { Goal } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGoals } from "@/lib/context/GoalContext";

interface GoalListProps {
  goals: Goal[];
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  onViewDetails: (goal: Goal) => void;
}

export function GoalList({ goals, onEdit, onDelete, onViewDetails }: GoalListProps) {
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const { calculateActualProgress, calculatePlannedProgress } = useGoals();

  const toggleExpand = (goalId: string) => {
    setExpandedGoalId(expandedGoalId === goalId ? null : goalId);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const calculateProgressPercentage = (goal: Goal) => {
    const actual = calculateActualProgress(goal.id);
    return Math.min(Math.round((actual / goal.totalRequiredTime) * 100), 100);
  };

  const calculatePlannedPercentage = (goal: Goal) => {
    const planned = calculatePlannedProgress(goal);
    return Math.min(Math.round((planned / goal.totalRequiredTime) * 100), 100);
  };

  const getStatusColor = (goal: Goal) => {
    const actualPercentage = calculateProgressPercentage(goal);
    const plannedPercentage = calculatePlannedPercentage(goal);

    if (actualPercentage >= plannedPercentage) {
      return "bg-green-500"; // On track or ahead
    } else if (plannedPercentage - actualPercentage < 10) {
      return "bg-yellow-500"; // Slightly behind
    } else {
      return "bg-red-500"; // Significantly behind
    }
  };

  if (goals.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No goals yet. Create your first goal to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {goals.map((goal) => (
        <Card key={goal.id} className="w-full">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{goal.title}</CardTitle>
                <CardDescription>Deadline: {formatDate(goal.deadline)}</CardDescription>
              </div>
              <div className="flex items-center space-x-1">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(goal)}`} />
                <span className="text-sm">{calculateProgressPercentage(goal)}%</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pb-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div className={`h-2.5 rounded-full ${getStatusColor(goal)}`} style={{ width: `${calculateProgressPercentage(goal)}%` }}></div>
            </div>

            {expandedGoalId === goal.id && (
              <div className="mt-4 space-y-2 text-sm">
                {goal.description && <p className="text-gray-600 dark:text-gray-400">{goal.description}</p>}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="font-medium">Total Required:</p>
                    <p>{goal.totalRequiredTime} hours</p>
                  </div>
                  <div>
                    <p className="font-medium">Progress:</p>
                    <p>{calculateActualProgress(goal.id)} hours</p>
                  </div>
                  {goal.dailyTimeAllotment ? (
                    <div>
                      <p className="font-medium">Daily Goal:</p>
                      <p>{goal.dailyTimeAllotment} hours</p>
                    </div>
                  ) : null}
                  {goal.weeklyTimeAllotment ? (
                    <div>
                      <p className="font-medium">Weekly Goal:</p>
                      <p>{goal.weeklyTimeAllotment} hours</p>
                    </div>
                  ) : null}
                  {goal.monthlyTimeAllotment ? (
                    <div>
                      <p className="font-medium">Monthly Goal:</p>
                      <p>{goal.monthlyTimeAllotment} hours</p>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between pt-2">
            <Button variant="ghost" size="sm" onClick={() => toggleExpand(goal.id)}>
              {expandedGoalId === goal.id ? "Less" : "More"}
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => onViewDetails(goal)}>
                Details
              </Button>
              <Button variant="outline" size="sm" onClick={() => onEdit(goal)}>
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(goal.id)}>
                Delete
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
