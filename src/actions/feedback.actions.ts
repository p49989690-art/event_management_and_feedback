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
  const insertPayload = {
    ...validated,
    is_anonymous: !!data.is_anonymous, // Ensure boolean
    user_id: data.is_anonymous ? null : user?.id,
    submission_id: crypto.randomUUID(),
    sentiment,
    ai_analysis: null, // AI removed
  };

  const { data: feedback, error } = await supabase
    .from("feedback")
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    console.error("Feedback creation error:", error);
    throw new Error(`Failed to create feedback: ${error.message} (Code: ${error.code})`);
  }

  revalidatePath(`/events/${validated.event_id}`);
  
  // Refresh analytics
  await supabase.rpc("refresh_feedback_analytics");
  
  return feedback;
}

export async function submitFeedbackBatch(
  commonData: {
    event_id: string;
    name?: string;
    is_anonymous?: boolean;
    user_id?: string;
  },
  items: Array<{
    category: string;
    rating: number;
    comment?: string;
  }>
) {
  const supabase = await createClient();

  // Validate user if not anonymous
  // (Logic similar to single create)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !commonData.is_anonymous) {
    // If not logged in and not explicitly anonymous, we still allow submission
    // effectively as "guest" but we won't have a user_id.
    // The previous check forced users to login if they wanted to "be themselves",
    // but for public links, we should allow "Name: John Doe" without user_id.
  }

  // Prepare payloads with sentiment analysis
  const submissionId = crypto.randomUUID();
  
  const payloads = await Promise.all(
    items.map(async (item) => {
      let sentiment = "neutral";
      if (item.comment && item.comment.length > 0) {
        sentiment = calculateBasicSentiment(item.comment);
      }

      return {
        event_id: commonData.event_id,
        name: commonData.name,
        is_anonymous: !!commonData.is_anonymous,
        user_id: user?.id || null, 
        submission_id: submissionId, // Grouping key
        category: item.category,
        rating: item.rating,
        comment: item.comment,
        sentiment,
        ai_analysis: null,
      };
    })
  );

  const { data, error } = await supabase
    .from("feedback")
    .insert(payloads)
    .select();

  if (error) {
    console.error("Batch feedback error:", error);
    throw new Error(`Failed to submit feedback: ${error.message}`);
  }

  revalidatePath(`/events/${commonData.event_id}`);
  await supabase.rpc("refresh_feedback_analytics");

  return data;
}

export async function getFeedbackByEvent(eventId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("created_by", user.id)
    .single();

  if (!event) {
     // Either event doesn't exist or isn't owned by user.
     // Throwing Error is safe.
     throw new Error("Unauthorized or Event not found");
  }

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("created_by", user.id)
    .single();

  if (!event) {
     throw new Error("Unauthorized or Event not found");
  }

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get IDs of events created by this user
  const { data: userEvents } = await supabase
    .from("events")
    .select("id")
    .eq("created_by", user.id);

  const eventIds = userEvents?.map((e) => e.id) || [];

  if (eventIds.length === 0) {
    return [];
  }

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
    .in("event_id", eventIds) // Filter by my events
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch feedback: ${error.message}`);
  }

  return feedback;
}
