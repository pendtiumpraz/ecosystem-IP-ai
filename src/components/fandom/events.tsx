import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Event } from "@/types/fandom";

interface FandomEventsProps {
  events: Event[];
}

export function FandomEvents({ events }: FandomEventsProps) {
  const [filter, setFilter] = useState("all");

  const filteredEvents = events.filter(event => {
    return filter === "all" || event.type === filter;
  });

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Filter by type:</span>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Create Event Button */}
      <div className="flex justify-end">
        <Button>Create Event</Button>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}

function EventCard({ event }: { event: Event }) {
  const isFull = event.currentParticipants >= event.maxParticipants;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-lg">{event.title}</CardTitle>
          <Badge variant={isFull ? "destructive" : "default"}>
            {isFull ? "Full" : `${event.currentParticipants}/${event.maxParticipants}`}
          </Badge>
        </div>
        <CardDescription>{event.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>📅</span>
          <span>{event.date.toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>📍</span>
          <span>{event.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>👥</span>
          <span>Organized by {event.organizerName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>🎯</span>
          <span>{event.type} event</span>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          disabled={isFull}
          variant={isFull ? "outline" : "default"}
          className={isFull ? "cursor-not-allowed opacity-50" : ""}
        >
          {isFull ? "Event Full" : "Join Event"}
        </Button>
      </CardFooter>
    </Card>
  );
}