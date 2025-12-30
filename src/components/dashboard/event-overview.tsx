import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export function EventOverview({ events }: { events: any[] }) {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Top Performing Events</CardTitle>
        <CardDescription>Events with highest ratings.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.event_id}
              className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
            >
              <div>
                <p className="font-medium">{event.event_title}</p>
                <p className="text-sm text-gray-500">
                  {event.total_feedback} reviews
                </p>
              </div>
              <div className="text-right">
                <span className="font-bold text-lg">{event.avg_rating}</span>{" "}
                <span className="text-yellow-500">★</span>
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <p className="text-muted-foreground text-sm">No data available.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
