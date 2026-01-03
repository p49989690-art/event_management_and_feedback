import Link from "next/link";
import { getEvents } from "@/actions/events.actions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EventsListWithFilters } from "@/components/events/events-list-with-filters";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold dark:text-white">Events</h1>
        <Button asChild>
          <Link href="/events/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      <EventsListWithFilters events={events} />
    </div>
  );
}
