"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  feedbackSchema,
  type FeedbackFormData,
} from "@/lib/validations/feedback.schema";

function calculateBasicSentiment(
  text: string,
): "positive" | "neutral" | "negative" {
  const positiveWords = [
    "great",
    "excellent",
    "amazing",
    "wonderful",
    "good",
    "love",
    "liked",
    "best",
    "useful",
  ];
  const negativeWords = [
    "bad",
    "poor",
    "terrible",
    "horrible",
    "hate",
    "awful",
    "worst",
    "useless",
    "boring",
  ];

  const lowerText = text.toLowerCase();
  const positiveCount = positiveWords.filter((word) =>
    lowerText.includes(word),
  ).length;
  const negativeCount = negativeWords.filter((word) =>
    lowerText.includes(word),
  ).length;

  if (positiveCount > negativeCount) return "positive";
  if (negativeCount > positiveCount) return "negative";
  return "neutral";
}

export async function createFeedback(data: FeedbackFormData) {
  const supabase = await createClient();

  // Get current user (optional if anonymous)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !data.is_anonymous) {
    throw new Error("Unauthorized");
  }

  // Validate data
  const validated = feedbackSchema.parse(data);

  // Basic Sentiment Analysis
  let sentiment = "neutral";
  if (validated.comment) {
    sentiment = calculateBasicSentiment(validated.comment);
  }

  // Insert feedback
  const { data: feedback, error } = await supabase
    .from("feedback")
    .insert({
      ...validated,
      user_id: data.is_anonymous ? null : user?.id,
      sentiment,
      ai_analysis: null, // AI removed
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create feedback: ${error.message}`);
  }

  // Refresh analytics
  await supabase.rpc("refresh_feedback_analytics");

  revalidatePath(`/events/${validated.event_id}`);
  revalidatePath("/feedback");

  return feedback;
}

export async function getFeedbackByEvent(eventId: string) {
  const supabase = await createClient();

  const { data: feedback, error } = await supabase
    .from("feedback")
    .select(
      `
      *,
      profiles:user_id (
        full_name,
        email
      )
    `,
    )
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch feedback: ${error.message}`);
  }

  return feedback;
}

export async function getFeedbackAnalytics(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("feedback_analytics")
    .select("*")
    .eq("event_id", eventId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 is no rows
    // if no analytics yet, return default or null
    return null;
  }

  return data;
}

export async function getAllFeedback() {
  const supabase = await createClient();

  const { data: feedback, error } = await supabase
    .from("feedback")
    .select(
      `
        *,
        events (
            title
        ),
        profiles:user_id (
          full_name,
          email
        )
      `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch feedback: ${error.message}`);
  }

  return feedback;
}
