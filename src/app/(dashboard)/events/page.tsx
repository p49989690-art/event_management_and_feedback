import Link from "next/link";
import { getEvents } from "@/actions/events.actions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { format } from "date-fns";

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Events</h1>
        <Button asChild>
          <Link href="/events/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <CardTitle>{event.title}</CardTitle>
              <CardDescription>{event.event_type}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500">
                <p>Location: {event.location}</p>
                <p>Start: {format(new Date(event.start_date), "PPP p")}</p>
                <p>Status: {event.status}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/events/${event.id}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}

        {events.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-12">
            No events found. Create your first event!
          </div>
        )}
      </div>
    </div>
  );
}
