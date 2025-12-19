import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Community } from "@/types/fandom";

interface FandomCommunitiesProps {
  communities: Community[];
}

export function FandomCommunities({ communities }: FandomCommunitiesProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(search.toLowerCase()) ||
                         community.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || community.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search communities..."
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
              <SelectItem value="anime">Anime</SelectItem>
              <SelectItem value="gaming">Gaming</SelectItem>
              <SelectItem value="movies">Movies</SelectItem>
              <SelectItem value="music">Music</SelectItem>
              <SelectItem value="art">Art</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Communities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCommunities.map(community => (
          <CommunityCard key={community.id} community={community} />
        ))}
      </div>

      {/* Create Community Button */}
      <div className="text-center">
        <Button variant="outline" size="lg">
          Create Your Community
        </Button>
      </div>
    </div>
  );
}

function CommunityCard({ community }: { community: Community }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-lg">{community.name}</CardTitle>
          <Badge variant="outline">{community.category}</Badge>
        </div>
        <CardDescription>{community.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>👥</span>
          <span>{community.memberCount} members</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>📅</span>
          <span>Created {community.createdAt.toLocaleDateString()}</span>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button className="w-full">Join Community</Button>
      </CardFooter>
    </Card>
  );
}