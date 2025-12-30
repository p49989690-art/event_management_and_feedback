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
        // Event not found (likely deleted)
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md mx-auto text-center space-y-6">
                    <div className="bg-white dark:bg-neutral-900 p-8 rounded-lg shadow-md dark:border dark:border-neutral-800">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Event Not Found</h1>
                        <p className="text-gray-600 dark:text-neutral-400 mb-6">
                            This event may have been deleted or the link is invalid.
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
