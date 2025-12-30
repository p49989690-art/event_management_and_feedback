import { createEvent } from "@/actions/events.actions";
import { EventForm } from "@/components/events/event-form";

export default function NewEventPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Create New Event</h1>
        <p className="text-gray-500">
          Fill in the details to create a new event.
        </p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <EventForm onSubmit={createEvent} />
      </div>
    </div>
  );
}
