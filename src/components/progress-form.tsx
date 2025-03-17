import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { logProgressSchema, type LogProgressFormData, type Goal } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ProgressFormProps {
  goal: Goal;
  onSubmit: (data: LogProgressFormData) => void;
}

export function ProgressForm({ goal, onSubmit }: ProgressFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        date: data.date instanceof Date ? data.date : new Date(data.date as unknown as string),
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
                <Input
                  type="number"
                  min="0"
                  step="0.25"
                  placeholder="1.5"
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
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                    >
                      {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value instanceof Date ? field.value : new Date(field.value as string)}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? "Saving..." : "Log Progress"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
