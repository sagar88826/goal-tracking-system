import { useState } from "react";
import { ProgressEntry } from "@/lib/types";
import { useGoals } from "@/lib/context/goal-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Analytics() {
  const { goals, getProgressForGoal, calculateActualProgress, calculatePlannedProgress } = useGoals();
  const [activeTab, setActiveTab] = useState("overview");

  // Skip if no goals
  if (goals.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No goals yet. Create your first goal to see analytics!</p>
      </div>
    );
  }

  // Calculate overall progress stats
  const totalRequiredHours = goals.reduce((total, goal) => total + goal.totalRequiredTime, 0);
  const totalCompletedHours = goals.reduce((total, goal) => total + calculateActualProgress(goal.id), 0);
  const totalPlannedHours = goals.reduce((total, goal) => total + calculatePlannedProgress(goal), 0);
  const overallCompletionPercentage = Math.round((totalCompletedHours / totalRequiredHours) * 100) || 0;
  const overallPlannedPercentage = Math.round((totalPlannedHours / totalRequiredHours) * 100) || 0;

  // Calculate on-track vs behind goals
  const onTrackGoals = goals.filter((goal) => calculateActualProgress(goal.id) >= calculatePlannedProgress(goal));
  const behindGoals = goals.filter((goal) => calculateActualProgress(goal.id) < calculatePlannedProgress(goal));

  // Get all progress entries for time distribution analysis
  const allProgressEntries: { entry: ProgressEntry; goalTitle: string }[] = [];
  goals.forEach((goal) => {
    const entries = getProgressForGoal(goal.id);
    entries.forEach((entry) => {
      allProgressEntries.push({
        entry,
        goalTitle: goal.title,
      });
    });
  });

  // Group progress by day of week for weekly pattern analysis
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const progressByDayOfWeek = dayNames.map((day) => ({
    day,
    hours: 0,
    count: 0,
  }));

  allProgressEntries.forEach(({ entry }) => {
    const date = new Date(entry.date);
    const dayOfWeek = date.getDay();
    progressByDayOfWeek[dayOfWeek].hours += entry.timeSpent;
    progressByDayOfWeek[dayOfWeek].count += 1;
  });

  // Calculate most productive day
  const mostProductiveDay = [...progressByDayOfWeek].sort((a, b) => b.hours - a.hours)[0];

  // Calculate recent progress trend (last 7 entries)
  const recentEntries = [...allProgressEntries].sort((a, b) => new Date(b.entry.date).getTime() - new Date(a.entry.date).getTime()).slice(0, 7);

  // Calculate goal with best progress relative to plan
  const goalProgressRatios = goals.map((goal) => {
    const actual = calculateActualProgress(goal.id);
    const planned = calculatePlannedProgress(goal);
    const ratio = planned > 0 ? actual / planned : 0;
    return { goal, ratio };
  });

  const bestPerformingGoal = [...goalProgressRatios].sort((a, b) => b.ratio - a.ratio)[0]?.goal;

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics & Insights</h2>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Overall Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{overallCompletionPercentage}%</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {totalCompletedHours.toFixed(1)} of {totalRequiredHours.toFixed(1)} hours
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                  <div className="h-2.5 rounded-full bg-blue-600" style={{ width: `${overallCompletionPercentage}%` }}></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Goal Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>On Track: {onTrackGoals.length}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Behind: {behindGoals.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Planned vs Actual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Planned</span>
                      <span>{overallPlannedPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="h-2 rounded-full bg-blue-300" style={{ width: `${overallPlannedPercentage}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Actual</span>
                      <span>{overallCompletionPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="h-2 rounded-full bg-blue-600" style={{ width: `${overallCompletionPercentage}%` }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {bestPerformingGoal && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Best Performing Goal</CardTitle>
                <CardDescription>{bestPerformingGoal.title}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">You're making excellent progress on this goal! Keep up the good work.</p>
              </CardContent>
            </Card>
          )}

          {recentEntries.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentEntries.map(({ entry, goalTitle }, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <div>
                        <span className="font-medium">{entry.timeSpent} hours</span>
                        <span className="text-gray-500 dark:text-gray-400"> on {goalTitle}</span>
                      </div>
                      <span className="text-gray-500 dark:text-gray-400">{formatDate(entry.date)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Progress Patterns</CardTitle>
              <CardDescription>Your progress distribution throughout the week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progressByDayOfWeek.map((day, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{day.day}</span>
                      <span>{day.hours.toFixed(1)} hours</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${day.day === mostProductiveDay.day ? "bg-green-500" : "bg-blue-500"}`}
                        style={{
                          width: `${Math.max((day.hours / Math.max(...progressByDayOfWeek.map((d) => d.hours))) * 100, day.hours > 0 ? 5 : 0)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {mostProductiveDay.hours > 0 && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-md">
                  <p className="text-green-700 dark:text-green-400">
                    <span className="font-medium">Most productive day:</span> {mostProductiveDay.day}({mostProductiveDay.hours.toFixed(1)} hours)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Goal Distribution</CardTitle>
              <CardDescription>How your time is distributed across goals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {goals.map((goal) => {
                  const hoursSpent = calculateActualProgress(goal.id);
                  const percentage = Math.round((hoursSpent / totalCompletedHours) * 100) || 0;

                  return (
                    <div key={goal.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="truncate max-w-[200px]">{goal.title}</span>
                        <span>
                          {percentage}% ({hoursSpent.toFixed(1)} hours)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="h-2 rounded-full bg-blue-500" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Personalized Insights</CardTitle>
              <CardDescription>Recommendations based on your progress patterns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {behindGoals.length > 0 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-md">
                  <h3 className="font-medium text-yellow-800 dark:text-yellow-400 mb-1">Goals Needing Attention</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {behindGoals.map((goal) => (
                      <li key={goal.id} className="text-sm text-yellow-700 dark:text-yellow-400">
                        {goal.title} - {calculatePlannedProgress(goal).toFixed(1)} hours planned vs {calculateActualProgress(goal.id).toFixed(1)} hours completed
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {mostProductiveDay.hours > 0 && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-md">
                  <h3 className="font-medium text-green-800 dark:text-green-400 mb-1">Optimize Your Schedule</h3>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    You're most productive on {mostProductiveDay.day}s. Consider scheduling more work on this day to maximize your efficiency.
                  </p>
                </div>
              )}

              {onTrackGoals.length > 0 && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-md">
                  <h3 className="font-medium text-blue-800 dark:text-blue-400 mb-1">Build on Your Success</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    You're doing great with {onTrackGoals.length} goal(s)! Consider applying similar strategies to goals where you're falling behind.
                  </p>
                </div>
              )}

              {goals.some((goal) => !goal.dailyTimeAllotment && !goal.weeklyTimeAllotment) && (
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-md">
                  <h3 className="font-medium text-purple-800 dark:text-purple-400 mb-1">Set Time Allotments</h3>
                  <p className="text-sm text-purple-700 dark:text-purple-400">
                    Some of your goals don't have daily or weekly time allotments. Setting these can help you stay on track with regular progress.
                  </p>
                </div>
              )}

              <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-md">
                <h3 className="font-medium mb-1">General Tips</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Break down large goals into smaller, manageable tasks</li>
                  <li>Track your progress consistently to stay motivated</li>
                  <li>Celebrate small wins along the way to your goal</li>
                  <li>Review your goals regularly and adjust as needed</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
