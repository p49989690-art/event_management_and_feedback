import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface FeedbackListProps {
  feedback: any[];
}

export function FeedbackList({ feedback }: FeedbackListProps) {
  if (feedback.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">No feedback yet.</div>
    );
  }

  // Group feedback by submission_id (preferred) or fallback to composite key
  const groupedFeedback = feedback.reduce((groups, item) => {
    const key = item.submission_id
      ? item.submission_id
      : `${item.event_id}-${item.created_at}-${item.user_id || item.name || 'anon'}`;
    if (!groups[key]) {
      groups[key] = {
        master: item, // Holds common info like user, date, rating (which is shared)
        items: [],
      };
    }
    groups[key].items.push(item);
    return groups;
  }, {} as Record<string, { master: any; items: any[] }>);

  // Sort groups by date descending
  const sortedGroups = Object.values(groupedFeedback).sort(
    (a: any, b: any) =>
      new Date(b.master.created_at).getTime() -
      new Date(a.master.created_at).getTime()
  );

  return (
    <div className="space-y-6">
      {sortedGroups.map((group: any, groupIndex: number) => (
        <Card key={`${group.master.id}-group`}>
          <CardHeader className="pb-3 bg-neutral-50/50 dark:bg-neutral-900/50">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <span>
                    {group.master.is_anonymous
                      ? "Anonymous"
                      : group.master.profiles?.full_name || group.master.name || "Guest"}
                  </span>
                  {group.master.events?.title && (
                    <span className="text-sm font-normal text-muted-foreground">
                      on {group.master.events.title}
                    </span>
                  )}
                </CardTitle>
                <CardDescription className="mt-1">
                  {format(new Date(group.master.created_at), "PPP p")}
                </CardDescription>
              </div>

              {/* Overall Rating Display */}
              <div className="flex flex-col items-end gap-1">
                <div className="flex text-yellow-500 text-lg">
                  {Array.from({ length: group.master.rating || 0 }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                  {Array.from({ length: 5 - (group.master.rating || 0) }).map((_, i) => (
                    <span key={i} className="text-gray-300 dark:text-gray-600">★</span>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Overall Rating
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            {group.items.map((item: any, index: number) => (
              <div key={item.id} className="flex flex-col gap-2">
                {index > 0 && <Separator className="my-2" />}
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-sm font-medium min-w-[80px] justify-center">
                    {item.category}
                  </Badge>
                  <Badge
                    variant={
                      item.sentiment === "positive"
                        ? "default"
                        : item.sentiment === "negative"
                          ? "destructive"
                          : "secondary"
                    }
                    className="text-[10px] px-2 h-5"
                  >
                    {item.sentiment}
                  </Badge>
                </div>
                {item.comment && (
                  <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed pl-1">
                    {item.comment}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
