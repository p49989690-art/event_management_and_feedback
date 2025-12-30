import { getEvent } from "@/actions/events.actions";
import { createFeedback } from "@/actions/feedback.actions";
import { FeedbackForm } from "@/components/feedback/feedback-form";

export default async function PublicFeedbackPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const event = await getEvent(id);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Event Feedback</h1>
                    <p className="mt-2 text-gray-600">
                        Current Event: <span className="font-semibold">{event.title}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                        {event.event_type} • {event.location}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <FeedbackForm eventId={event.id} onSubmit={createFeedback} />
                </div>
            </div>
        </div>
    );
}
