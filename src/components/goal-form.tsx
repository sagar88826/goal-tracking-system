import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createGoalSchema, type CreateGoalFormData, type Goal } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface GoalFormProps {
  onSubmit: (data: CreateGoalFormData) => void;
  initialData?: Partial<Goal>;
  isEditing?: boolean;
}

export function GoalForm({ onSubmit, initialData, isEditing = false }: GoalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateGoalFormData>({
    resolver: zodResolver(createGoalSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      totalRequiredTime: initialData?.totalRequiredTime || 0,
      deadline: initialData?.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 1 week from now
      dailyTimeAllotment: initialData?.dailyTimeAllotment || 0,
      weeklyTimeAllotment: initialData?.weeklyTimeAllotment || 0,
      monthlyTimeAllotment: initialData?.monthlyTimeAllotment || 0,
    },
  });

  const handleSubmit = async (data: CreateGoalFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      if (!isEditing) {
        form.reset(); // Only reset if creating a new goal
      }
    } catch (error) {
      console.error("Error submitting goal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Learn Spanish" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Become conversational in Spanish" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="totalRequiredTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Required Time (hours)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="100"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Deadline</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="dailyTimeAllotment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Daily Goal (hours)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="1"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weeklyTimeAllotment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weekly Goal (hours)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="7"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="monthlyTimeAllotment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Goal (hours)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="30"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditing ? "Update Goal" : "Create Goal"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
