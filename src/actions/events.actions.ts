"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  eventSchema,
  type EventFormData,
} from "@/lib/validations/event.schema";

export async function createEvent(data: EventFormData) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  // Validate data
  const validated = eventSchema.parse(data);

  console.log("Creating event for user:", user.id);

  // Insert event
  const { data: event, error } = await supabase
    .from("events")
    .insert({
      ...validated,
      created_by: user.id,
      status: validated.status || "draft",
    })
    .select()
    .single();

  if (error) {
    console.error('Create event error:', error);
    // throw new Error(`Failed to create event: ${error.message}`);
    // Instead of throwing, for now let's throw to keep signature but logging better
    throw new Error(error.message);
  }

  revalidatePath("/events");
  redirect(`/events/${event.id}`);
}

export async function updateEvent(id: string, data: EventFormData) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  // Validate data
  const validated = eventSchema.parse(data);

  // Update event
  const { data: event, error } = await supabase
    .from("events")
    .update(validated)
    .eq("id", id)
    .eq("created_by", user.id) // Ensure user owns the event
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update event: ${error.message}`);
  }

  revalidatePath(`/events/${id}`);
  revalidatePath("/events");

  return event;
}

export async function deleteEvent(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) {
    throw new Error(`Failed to delete event: ${error.message}`);
  }

  // Revalidate all affected paths
  revalidatePath("/events");
  revalidatePath("/dashboard");
  revalidatePath("/feedback");
  redirect("/events");
}

export async function getEvent(id: string) {
  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from("events")
    .select(
      `
      *,
      profiles:created_by (
        full_name,
        email
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Event not found: ${error.message}`);
  }

  return event;
}

export async function getEvents(filters?: {
  status?: string;
  event_type?: string;
  search?: string;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("events")
    .select(
      `
      *,
      profiles:created_by (
        full_name,
        email
      )
    `,
    )
    .order("start_date", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.event_type) {
    query = query.eq("event_type", filters.event_type);
  }

  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
    );
  }

  const { data: events, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch events: ${error.message}`);
  }

  return events;
}
