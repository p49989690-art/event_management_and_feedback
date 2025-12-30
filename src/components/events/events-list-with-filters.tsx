"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { EventFilters } from "./event-filters";

interface Event {
    id: string;
    title: string;
    event_type: string;
    location: string | null;
    start_date: string;
    status: string | null;
}

interface EventsListWithFiltersProps {
    events: Event[];
}

export function EventsListWithFilters({ events }: EventsListWithFiltersProps) {
    const [filters, setFilters] = useState({
        search: "",
        status: "all",
        eventType: "all",
    });

    const filteredEvents = useMemo(() => {
        return events.filter((event) => {
            // Search filter
            if (
                filters.search &&
                !event.title.toLowerCase().includes(filters.search.toLowerCase())
            ) {
                return false;
            }

            // Status filter
            if (filters.status !== "all" && event.status !== filters.status) {
                return false;
            }

            // Event type filter
            if (filters.eventType !== "all" && event.event_type !== filters.eventType) {
                return false;
            }

            return true;
        });
    }, [events, filters]);

    return (
        <div className="space-y-6">
            <EventFilters onFilter={setFilters} />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredEvents.map((event) => (
                    <Card key={event.id} className="dark:bg-neutral-900 dark:border-neutral-800">
                        <CardHeader>
                            <CardTitle className="dark:text-white">{event.title}</CardTitle>
                            <CardDescription className="capitalize">{event.event_type}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                                <p>📍 {event.location || "No location"}</p>
                                <p>📅 {format(new Date(event.start_date), "PPP p")}</p>
                                <p>
                                    <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${event.status === "published"
                                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                            : event.status === "draft"
                                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                : event.status === "cancelled"
                                                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                            }`}
                                    >
                                        {event.status}
                                    </span>
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button asChild variant="outline" className="w-full dark:border-gray-600">
                                <Link href={`/events/${event.id}`}>View Details</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}

                {filteredEvents.length === 0 && (
                    <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-12">
                        {events.length === 0
                            ? "No events found. Create your first event!"
                            : "No events match your filters."}
                    </div>
                )}
            </div>
        </div>
    );
}
