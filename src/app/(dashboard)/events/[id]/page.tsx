import { getEvent, updateEvent, deleteEvent } from "@/actions/events.actions";
import { EventForm } from "@/components/events/event-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { EventFormData } from "@/lib/validations/event.schema";

export default async function EventDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await getEvent(params.id);

  // Map DB event to form data type
  const formData: EventFormData = {
    title: event.title,
    description: event.description || undefined,
    event_type: event.event_type as EventFormData['event_type'],
    location: event.location || '',
    start_date: event.start_date,
    end_date: event.end_date,
    max_attendees: event.max_attendees || undefined,
    status: event.status as EventFormData['status'],
    image_url: event.image_url || undefined,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/events">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Event Details</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <EventForm
          initialData={formData}
          onSubmit={updateEvent.bind(null, event.id)}
          isEditing
        />
      </div>

      <div className="flex justify-end pt-4">
        <form action={deleteEvent.bind(null, event.id)}>
          <Button variant="destructive" type="submit">
            Delete Event
          </Button>
        </form>
      </div>
    </div>
  );
}
