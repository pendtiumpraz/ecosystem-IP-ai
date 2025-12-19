import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Discussion } from "@/types/fandom";

interface FandomDiscussionsProps {
  discussions: Discussion[];
}

export function FandomDiscussions({ discussions }: FandomDiscussionsProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filteredDiscussions = discussions.filter(discussion => {
    const matchesSearch = discussion.title.toLowerCase().includes(search.toLowerCase()) ||
                         discussion.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || discussion.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search discussions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="questions">Questions</SelectItem>
              <SelectItem value="art">Art</SelectItem>
              <SelectItem value="fanfic">Fan Fiction</SelectItem>
              <SelectItem value="cosplay">Cosplay</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* New Discussion Button */}
      <div className="flex justify-end">
        <Button>Create New Discussion</Button>
      </div>

      {/* Discussions List */}
      <div className="space-y-4">
        {filteredDiscussions.map(discussion => (
          <DiscussionCard key={discussion.id} discussion={discussion} />
        ))}
      </div>
    </div>
  );
}

function DiscussionCard({ discussion }: { discussion: Discussion }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{discussion.title}</CardTitle>
          {discussion.isPinned && (
            <Badge variant="outline">Pinned</Badge>
          )}
        </div>
        <CardDescription>{discussion.content.substring(0, 100)}...</CardDescription>
      </CardHeader>
      
      <CardContent className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <span>👤</span>
          <span>{discussion.authorName}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>💬</span>
          <span>{discussion.replyCount} replies</span>
        </div>
        <div className="flex items-center gap-1">
          <span>👁️</span>
          <span>{discussion.viewCount} views</span>
        </div>
        <div className="flex items-center gap-1">
          <span>📅</span>
          <span>{discussion.createdAt.toLocaleDateString()}</span>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button variant="ghost" size="sm">View Discussion</Button>
      </CardFooter>
    </Card>
  );
}