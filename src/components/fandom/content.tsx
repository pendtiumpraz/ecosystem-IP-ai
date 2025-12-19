import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Content } from "@/types/fandom";

interface FandomContentProps {
  contents: Content[];
}

export function FandomContent({ contents }: FandomContentProps) {
  const [filter, setFilter] = useState("all");

  const filteredContent = contents.filter(content => {
    return filter === "all" || content.type === filter;
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
            <SelectItem value="all">All Content</SelectItem>
            <SelectItem value="art">Art</SelectItem>
            <SelectItem value="fanfic">Fan Fiction</SelectItem>
            <SelectItem value="cosplay">Cosplay</SelectItem>
            <SelectItem value="review">Reviews</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Upload Button */}
      <div className="flex justify-end">
        <Button>Upload Content</Button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContent.map(content => (
          <ContentCard key={content.id} content={content} />
        ))}
      </div>
    </div>
  );
}

function ContentCard({ content }: { content: Content }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-lg">{content.title}</CardTitle>
          <Badge variant="secondary">{content.type}</Badge>
        </div>
        <CardDescription>{content.description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        {content.imageUrl && (
          <div className="aspect-video bg-gray-100 rounded-md overflow-hidden mb-4">
            <img 
              src={content.imageUrl} 
              alt={content.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 mb-4">
          {content.tags.map((tag, index) => (
            <Badge key={index} variant="outline">{tag}</Badge>
          ))}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <span>❤️</span>
            <span>{content.likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>💬</span>
            <span>{content.comments}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>👤</span>
            <span>{content.authorName}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button variant="ghost" size="sm">View Details</Button>
      </CardFooter>
    </Card>
  );
}