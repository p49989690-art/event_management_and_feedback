import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FeedbackListProps {
  feedback: any[];
}

export function FeedbackList({ feedback }: FeedbackListProps) {
  if (feedback.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">No feedback yet.</div>
    );
  }

  return (
    <div className="space-y-4">
      {feedback.map((item) => (
        <Card key={item.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-base font-semibold">
                  {item.is_anonymous
                    ? "Anonymous"
                    : item.profiles?.full_name || "User"}
                </CardTitle>
                <CardDescription>
                  {format(new Date(item.created_at), "PPP")} •{" "}
                  {item.category || "General"}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    item.sentiment === "positive"
                      ? "default"
                      : item.sentiment === "negative"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {item.sentiment}
                </Badge>
                <div className="flex text-yellow-500 text-sm">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{item.comment}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
