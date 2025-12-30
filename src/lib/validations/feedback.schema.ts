import { z } from "zod";

export const feedbackSchema = z.object({
  event_id: z.string().uuid(),
  rating: z.number().int().min(1, "Rating is required").max(5),
  category: z
    .enum(["content", "organization", "venue", "speaker", "overall"])
    .optional(),
  comment: z
    .string()
    .min(10, "Feedback must be at least 10 characters")
    .max(1000)
    .optional(),
  name: z.string().max(100).optional(),
  is_anonymous: z.boolean().default(false).optional(),
});

export type FeedbackFormData = z.infer<typeof feedbackSchema>;

