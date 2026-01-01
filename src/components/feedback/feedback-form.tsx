"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { submitFeedbackBatch } from "@/actions/feedback.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FeedbackFormProps {
  eventId: string;
  // We can ignore the single-item onSubmit prop now as we use the server action directly
  // or wrap it if needed. For now, let's keep the signature compatible or optional.
  onSubmit?: any;
}

const CATEGORIES = [
  { id: "content", label: "Content" },
  { id: "organization", label: "Organization" },
  { id: "venue", label: "Venue" },
  { id: "speaker", label: "Speaker" },
  { id: "overall", label: "Overall Experience" },
];

export function FeedbackForm({ eventId }: FeedbackFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [overallRating, setOverallRating] = useState(0);

  // State to hold comments for each category
  const [comments, setComments] = useState<Record<string, string>>({
    content: "",
    organization: "",
    venue: "",
    speaker: "",
    overall: "",
  });

  // Global state for name/anon
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      is_anonymous: false,
    }
  });

  const handleCommentChange = (category: string, comment: string) => {
    setComments(prev => ({
      ...prev,
      [category]: comment
    }));
  };

  const onSubmitForm = async (data: { name: string; is_anonymous: boolean }) => {
    if (overallRating === 0) {
      toast.error("Please provide an overall rating.");
      return;
    }

    // Always include "Overall" entry
    const itemsToSubmit = [{
      category: "overall",
      rating: overallRating,
      comment: comments.overall
    }];

    // Add other categories ONLY if they have comments
    CATEGORIES.forEach(cat => {
      if (cat.id !== "overall" && comments[cat.id]?.trim()) {
        itemsToSubmit.push({
          category: cat.id,
          rating: overallRating, // Inherit overall rating
          comment: comments[cat.id]
        });
      }
    });

    setIsSubmitting(true);
    try {
      await submitFeedbackBatch(
        {
          event_id: eventId,
          name: data.name,
          is_anonymous: data.is_anonymous,
        },
        itemsToSubmit
      );

      toast.success("Thank you! Your feedback has been submitted.");

      // Reset form
      reset();
      setOverallRating(0);
      setComments({
        content: "",
        organization: "",
        venue: "",
        speaker: "",
        overall: "",
      });

    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-8">

      {/* Global Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Your Name (Optional)</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Enter your name"
            className="dark:bg-neutral-900 dark:border-neutral-700"
          />
        </div>

        <div className="flex items-center gap-2 h-full pt-6">
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
      </div>

      {/* Main Overall Rating */}
      <div className="flex justify-center pb-2">
        <div className="flex gap-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setOverallRating(star)}
              className={`text-4xl transition-all duration-200 transform hover:scale-110 ${star <= overallRating
                ? "text-yellow-400 drop-shadow-sm"
                : "text-gray-300 dark:text-gray-600 hover:text-yellow-200"
                }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {CATEGORIES.map((category) => (
          <Card key={category.id} className="border dark:border-neutral-800">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base font-medium">{category.label}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Textarea
                placeholder={`Share your thoughts on the ${category.label.toLowerCase()}...`}
                value={comments[category.id]}
                onChange={(e) => handleCommentChange(category.id, e.target.value)}
                rows={3}
                className="resize-none dark:bg-neutral-900"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full py-6 text-lg">
        {isSubmitting ? "Submitting Feedback..." : "Submit Feedback"}
      </Button>
    </form>
  );
}
