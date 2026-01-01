import { getEvent } from "@/actions/events.actions";
import { createFeedback } from "@/actions/feedback.actions";
import { FeedbackForm } from "@/components/feedback/feedback-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function PublicFeedbackPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    let event;
    try {
        event = await getEvent(id);
    } catch {
        // Event not found (likely deleted, draft, or cancelled)
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md mx-auto text-center space-y-6">
                    <div className="bg-white dark:bg-neutral-900 p-8 rounded-lg shadow-md dark:border dark:border-neutral-800">
                        <div className="mb-4 text-5xl">📅</div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Event Not Available</h1>
                        <p className="text-gray-600 dark:text-neutral-400 mb-4">
                            This event feedback form is currently unavailable.
                        </p>
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                            <p className="text-sm text-blue-800 dark:text-blue-300 font-semibold mb-2">
                                ℹ️ Possible Reasons:
                            </p>
                            <ul className="text-sm text-blue-700 dark:text-blue-400 text-left space-y-1">
                                <li>• The event is still in <strong>draft</strong> status</li>
                                <li>• The event has been <strong>cancelled</strong></li>
                                <li>• The event link is invalid or expired</li>
                            </ul>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-neutral-500 mb-6">
                            Please contact the event organizer for more information.
                        </p>
                        <Button asChild>
                            <Link href="/">Go Home</Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Event Feedback</h1>
                    <p className="mt-2 text-gray-600 dark:text-neutral-400">
                        Current Event: <span className="font-semibold dark:text-white">{event.title}</span>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-neutral-500">
                        {event.event_type} • {event.location}
                    </p>
                </div>

                <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg shadow-md dark:border dark:border-neutral-800">
                    <FeedbackForm eventId={event.id} onSubmit={createFeedback} />
                </div>
            </div>
        </div>
    );
}
