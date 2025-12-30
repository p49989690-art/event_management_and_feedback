import { z } from "zod";

export const eventSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters").max(200),
    description: z.string().optional(),
    event_type: z.enum([
      "conference",
      "workshop",
      "seminar",
      "webinar",
      "meetup",
      "other",
    ]),
    location: z.string().min(2, "Location is required"),
    start_date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid start date"),
    end_date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid end date"),
    max_attendees: z.number().int().positive().optional(),
    status: z.enum(["draft", "published", "cancelled", "completed"]).optional(),
    image_url: z.string().url().optional(),
  })
  .refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
    message: "End date must be after start date",
    path: ["end_date"],
  });

export type EventFormData = z.infer<typeof eventSchema>;
