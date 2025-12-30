"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface EventFiltersProps {
    onFilter: (filters: {
        search: string;
        status: string;
        eventType: string;
    }) => void;
}

export function EventFilters({ onFilter }: EventFiltersProps) {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [eventType, setEventType] = useState("all");

    const handleFilter = () => {
        onFilter({ search, status, eventType });
    };

    const handleClear = () => {
        setSearch("");
        setStatus("all");
        setEventType("all");
        onFilter({ search: "", status: "all", eventType: "all" });
    };

    return (
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg border dark:border-neutral-800 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search events..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleFilter()}
                            className="pl-10 dark:bg-neutral-900 dark:border-neutral-700"
                        />
                    </div>
                </div>

                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-full md:w-40 dark:bg-neutral-900 dark:border-neutral-700">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={eventType} onValueChange={setEventType}>
                    <SelectTrigger className="w-full md:w-40 dark:bg-neutral-900 dark:border-neutral-700">
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="conference">Conference</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="seminar">Seminar</SelectItem>
                        <SelectItem value="webinar">Webinar</SelectItem>
                        <SelectItem value="meetup">Meetup</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>

                <div className="flex gap-2">
                    <Button onClick={handleFilter} className="flex-1 md:flex-none">
                        <Search className="h-4 w-4 mr-2" />
                        Filter
                    </Button>
                    <Button variant="outline" onClick={handleClear} className="flex-1 md:flex-none">
                        <X className="h-4 w-4 mr-2" />
                        Clear
                    </Button>
                </div>
            </div>
        </div>
    );
}
