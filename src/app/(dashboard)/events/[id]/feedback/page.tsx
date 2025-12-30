import { getFeedbackByEvent, createFeedback } from "@/actions/feedback.actions";
import { getEvent } from "@/actions/events.actions";
import { FeedbackForm } from "@/components/feedback/feedback-form";
import { FeedbackList } from "@/components/feedback/feedback-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function EventFeedbackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [event, feedback] = await Promise.all([
    getEvent(id),
    getFeedbackByEvent(id),
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/events/${id}`}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Feedback: {event.title}</h1>
          <p className="text-gray-500">
            {event.event_type} • {event.location}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Give Feedback</h2>
            <FeedbackForm eventId={event.id} onSubmit={createFeedback} />
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Reviews ({feedback.length})</h2>
          <FeedbackList feedback={feedback} />
        </div>
      </div>
    </div>
  );
}
