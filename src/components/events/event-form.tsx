"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  eventSchema,
  type EventFormData,
} from "@/lib/validations/event.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface EventFormProps {
  initialData?: EventFormData;
  onSubmit: (data: EventFormData) => Promise<any>;
  isEditing?: boolean;
}

export function EventForm({
  initialData,
  onSubmit,
  isEditing,
}: EventFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: initialData || {
      event_type: "conference",
      status: "draft",
      target_audience: "all",
    },
  });

  const onSubmitForm = async (data: EventFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      toast.success(isEditing ? "Event updated successfully!" : "Event created successfully!");
    } catch (error) {
      // Ignore NEXT_REDIRECT error as it's the expected behavior for successful server actions that redirect
      if (error instanceof Error && (error.message.includes("NEXT_REDIRECT") || error.message === "NEXT_REDIRECT")) {
        return;
      }
      console.error("Error submitting form:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save event");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Event Title *</Label>
        <Input
          id="title"
          {...register("title")}
          placeholder="Enter event title"
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Describe your event"
          rows={4}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="event_type">Event Type *</Label>
          <Controller
            control={control}
            name="event_type"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conference">Conference</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="seminar">Seminar</SelectItem>
                  <SelectItem value="webinar">Webinar</SelectItem>
                  <SelectItem value="meetup">Meetup</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.event_type && (
            <p className="text-sm text-red-500">{errors.event_type.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            {...register("location")}
            placeholder="Event location"
          />
          {errors.location && (
            <p className="text-sm text-red-500">{errors.location.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="start_date">Start Date *</Label>
          <Input
            id="start_date"
            type="datetime-local"
            {...register("start_date")}
          />
          {errors.start_date && (
            <p className="text-sm text-red-500">{errors.start_date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">End Date *</Label>
          <Input
            id="end_date"
            type="datetime-local"
            {...register("end_date")}
          />
          {errors.end_date && (
            <p className="text-sm text-red-500">{errors.end_date.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Controller
            control={control}
            name="status"
            defaultValue="draft"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_attendees">Maximum Attendees</Label>
          <Input
            id="max_attendees"
            type="number"
            {...register("max_attendees", { valueAsNumber: true })}
            placeholder="Leave empty for unlimited"
          />
          {errors.max_attendees && (
            <p className="text-sm text-red-500">{errors.max_attendees.message}</p>
          )}
        </div>

      </div>

      <div className="space-y-2">
        <Label htmlFor="target_audience">Target Audience</Label>
        <Controller
          control={control}
          name="target_audience"
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select target audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All (Students & Staff)</SelectItem>
                <SelectItem value="uum_student">UUM Student</SelectItem>
                <SelectItem value="uum_staff">UUM Staff</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.target_audience && (
          <p className="text-sm text-red-500">{errors.target_audience.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting
          ? "Saving..."
          : isEditing
            ? "Update Event"
            : "Create Event"}
      </Button>
    </form >
  );
}
