import { getAllFeedback } from "@/actions/feedback.actions";
import { FeedbackList } from "@/components/feedback/feedback-list";

export default async function FeedbackPage() {
  const feedback = await getAllFeedback();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold dark:text-white">All Feedback</h1>
        <p className="text-gray-500 dark:text-neutral-400">
          Overview of all feedback received across events.
        </p>
      </div>

      <FeedbackList feedback={feedback} />
    </div>
  );
}
