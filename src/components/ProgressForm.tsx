import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { logProgressSchema, type LogProgressFormData, type Goal } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface ProgressFormProps {
  goal: Goal;
  onSubmit: (data: LogProgressFormData) => void;
}

export function ProgressForm({ goal, onSubmit }: ProgressFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const form = useForm<LogProgressFormData>({
    resolver: zodResolver(logProgressSchema),
    defaultValues: {
      goalId: goal.id,
      timeSpent: 0,
      date: new Date(),
      notes: "",
    },
  });

  const handleSubmit = async (data: LogProgressFormData) => {
    setIsSubmitting(true);
    try {
      // Ensure date is a Date object
      const formattedData = {
        ...data,
        date: new Date(data.date as unknown as string),
      };
      await onSubmit(formattedData);
      form.reset({
        goalId: goal.id,
        timeSpent: 0,
        date: new Date(),
        notes: "",
      });
    } catch (error) {
      console.error("Error logging progress:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="timeSpent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time Spent (hours)</FormLabel>
              <FormControl>
                <Input type="number" min="0" step="0.25" placeholder="1.5" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} value={formatDateForInput(field.value as Date)} onChange={(e) => field.onChange(e.target.value)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="What did you accomplish?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Log Progress"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
