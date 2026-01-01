import { getEvent, updateEvent, deleteEvent } from "@/actions/events.actions";
import { EventForm } from "@/components/events/event-form";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { CopyLinkButton } from "@/components/copy-link-button";
import Link from "next/link";
import { ChevronLeft, Trash2 } from "lucide-react";
import type { EventFormData } from "@/lib/validations/event.schema";

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEvent(id);

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
    target_audience: (event.target_audience || 'all') as EventFormData['target_audience'],
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/events">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold dark:text-white">Event Details</h1>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 dark:bg-neutral-900 p-4 rounded-lg border dark:border-neutral-800">
        <div>
          <h3 className="font-medium dark:text-white">Public Feedback Link</h3>
          <p className="text-sm text-gray-500 dark:text-neutral-400">Share this link with attendees (no login required)</p>
          <code className="text-xs bg-gray-200 dark:bg-neutral-800 px-2 py-1 rounded select-all block mt-1 dark:text-neutral-300">
            {`/event-feedback/${event.id}`}
          </code>
        </div>
        <div className="flex gap-2">
          <CopyLinkButton link={`/event-feedback/${event.id}`} />
          <Button asChild variant="outline" className="dark:border-neutral-700">
            <Link href={`/event-feedback/${event.id}`} target="_blank">Open Link</Link>
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg shadow-sm border dark:border-neutral-800">
        <EventForm
          initialData={formData}
          onSubmit={updateEvent.bind(null, event.id)}
          isEditing
        />
      </div>

      <div className="flex justify-end pt-4">
        <form action={deleteEvent.bind(null, event.id)}>
          <SubmitButton
            className="bg-red-600 hover:bg-red-700 text-white"
            loadingText="Deleting..."
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Event
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
