import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function RecentFeedback({ feedback }: { feedback: any[] }) {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {feedback.map((item, index) => (
            <div key={index} className="flex items-center">
              <Avatar className="h-9 w-9">
                <AvatarFallback>
                  {item.is_anonymous
                    ? "A"
                    : item.profiles?.full_name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {item.is_anonymous ? "Anonymous" : item.profiles?.full_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {item.comment?.substring(0, 50)}...
                </p>
              </div>
              <div className="ml-auto font-medium">{item.rating} ★</div>
            </div>
          ))}
          {feedback.length === 0 && (
            <p className="text-muted-foreground text-sm">No recent feedback.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
