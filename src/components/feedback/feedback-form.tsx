"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  feedbackSchema,
  type FeedbackFormData,
} from "@/lib/validations/feedback.schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface FeedbackFormProps {
  eventId: string;
  onSubmit: (data: FeedbackFormData) => Promise<any>;
}

export function FeedbackForm({ eventId, onSubmit }: FeedbackFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(0);

  const {
    register,
    handleSubmit,
    control, // Use control for Select and manually handle rating if needed
    setValue,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      event_id: eventId,
      rating: 0, // Should be handled carefully with validation
      is_anonymous: false,
    },
  });

  // Register rating manually since it's a custom UI
  // register('rating') - but we need to set value

  const onSubmitForm = async (data: FeedbackFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <input type="hidden" {...register("event_id")} value={eventId} />

      {/* Star Rating */}
      <div className="space-y-2">
        <Label>Rating *</Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => {
                setRating(star);
                setValue("rating", star);
              }}
              className={`text-3xl transition-colors ${star <= rating ? "text-yellow-400" : "text-gray-300"
                }`}
            >
              ★
            </button>
          ))}
        </div>
        {errors.rating && (
          <p className="text-sm text-red-500">{errors.rating.message}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">Feedback Category</Label>
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="content">Content</SelectItem>
                <SelectItem value="organization">Organization</SelectItem>
                <SelectItem value="venue">Venue</SelectItem>
                <SelectItem value="speaker">Speaker</SelectItem>
                <SelectItem value="overall">Overall</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.category && (
          <p className="text-sm text-red-500">{errors.category.message}</p>
        )}
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <Label htmlFor="comment">Your Feedback</Label>
        <Textarea
          id="comment"
          {...register("comment")}
          placeholder="Share your experience..."
          rows={5}
        />
        {errors.comment && (
          <p className="text-sm text-red-500">{errors.comment.message}</p>
        )}
      </div>

      {/* Anonymous Option */}
      <div className="flex items-center gap-2">
        {/* using standard checkbox for simplicity as Shadcn Checkbox is uncontrolled mostly or needs Controller */}
        <input
          type="checkbox"
          id="is_anonymous"
          {...register("is_anonymous")}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <Label htmlFor="is_anonymous" className="font-normal cursor-pointer">
          Submit anonymously
        </Label>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Submitting..." : "Submit Feedback"}
      </Button>
    </form>
  );
}
