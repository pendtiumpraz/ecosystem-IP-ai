import { FandomCommunities } from "@/components/fandom/communities";
import { FandomDiscussions } from "@/components/fandom/discussions";
import { FandomContent } from "@/components/fandom/content";
import { FandomEvents } from "@/components/fandom/events";
import { FandomChat } from "@/components/fandom/chat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Community, Discussion, Content, Event, ChatMessage } from "@/types/fandom";

// Mock data for demonstration
const mockCommunities: Community[] = [
  {
    id: "1",
    name: "MODO Anime Fans",
    description: "Community for anime enthusiasts and creators",
    category: "anime",
    memberCount: 1250,
    creatorId: "user1",
    creatorName: "AnimeFan2024",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date(),
    isPublic: true,
    rules: ["Be respectful", "No spam", "Stay on topic"]
  },
  {
    id: "2",
    name: "Indonesian Gaming Community",
    description: "Connect with Indonesian gamers and game developers",
    category: "gaming",
    memberCount: 890,
    creatorId: "user2",
    creatorName: "GameMaster",
    createdAt: new Date("2024-02-20"),
    updatedAt: new Date(),
    isPublic: true,
    rules: ["Fair play", "Positive vibes", "Share knowledge"]
  }
];

const mockDiscussions: Discussion[] = [
  {
    id: "1",
    communityId: "1",
    title: "Favorite MODO characters?",
    content: "Who are your favorite characters from MODO Creator Verse? I love Gatotkaca from Legenda Nusantara!",
    authorId: "user3",
    authorName: "AnimeLover",
    category: "general",
    replyCount: 45,
    viewCount: 320,
    createdAt: new Date("2024-03-10"),
    updatedAt: new Date(),
    isPinned: false
  },
  {
    id: "2",
    communityId: "2",
    title: "Best Indonesian games of 2024",
    content: "What are your top picks for Indonesian games this year? Let's discuss!",
    authorId: "user4",
    authorName: "GamerPro",
    category: "general",
    replyCount: 23,
    viewCount: 189,
    createdAt: new Date("2024-03-12"),
    updatedAt: new Date(),
    isPinned: true
  }
];

const mockContent: Content[] = [
  {
    id: "1",
    communityId: "1",
    authorId: "user5",
    authorName: "ArtistFan",
    type: "art",
    title: "MODO Character Art",
    description: "My fan art of Kaka from Legenda Nusantara",
    imageUrl: "/placeholder.png",
    fileUrl: null,
    tags: ["art", "fanart", "mODO"],
    likes: 156,
    comments: 23,
    createdAt: new Date("2024-03-08")
  },
  {
    id: "2",
    communityId: "2",
    authorId: "user6",
    authorName: "WriterFan",
    type: "fanfic",
    title: "MODO Fan Fiction",
    description: "A story about Cyber Jakarta 2077 characters",
    imageUrl: null,
    fileUrl: "/placeholder.txt",
    tags: ["fanfic", "writing", "mODO"],
    likes: 89,
    comments: 15,
    createdAt: new Date("2024-03-09")
  }
];

const mockEvents: Event[] = [
  {
    id: "1",
    communityId: "1",
    title: "MODO Anime Watch Party",
    description: "Watch the latest MODO anime episodes together",
    type: "online",
    date: new Date("2024-04-15"),
    location: "Online - Discord",
    maxParticipants: 100,
    currentParticipants: 45,
    organizerId: "user7",
    organizerName: "AnimeOrganizer",
    createdAt: new Date("2024-03-05")
  },
  {
    id: "2",
    communityId: "2",
    title: "Indonesian Gaming Convention",
    description: "Meet Indonesian game developers and players",
    type: "offline",
    date: new Date("2024-05-20"),
    location: "Jakarta Convention Center",
    maxParticipants: 500,
    currentParticipants: 320,
    organizerId: "user8",
    organizerName: "GamingOrg",
    createdAt: new Date("2024-03-07")
  }
];

const mockMessages: ChatMessage[] = [
  {
    id: "1",
    chatId: "main-chat",
    authorId: "user9",
    authorName: "ChatUser1",
    content: "Hello everyone! Welcome to the chat!",
    timestamp: new Date("2024-03-14T10:30:00"),
    isEdited: false
  },
  {
    id: "2",
    chatId: "main-chat", 
    authorId: "user10",
    authorName: "ChatUser2",
    content: "Hi! Excited to be here!",
    timestamp: new Date("2024-03-14T10:32:00"),
    isEdited: false
  }
];

export default function FandomPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">MODO Creator Verse Fandom</h1>
          <p className="text-xl text-gray-600 mb-6">Connect with fellow creators and fans in our vibrant community</p>
          
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Badge variant="secondary">Community</Badge>
            <Badge variant="secondary">Discussions</Badge>
            <Badge variant="secondary">Content</Badge>
            <Badge variant="secondary">Events</Badge>
            <Badge variant="secondary">Chat</Badge>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="communities" className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-5">
            <TabsTrigger value="communities">Communities</TabsTrigger>
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>

          {/* Communities Tab */}
          <TabsContent value="communities" className="mt-6">
            <FandomCommunities communities={mockCommunities} />
          </TabsContent>

          {/* Discussions Tab */}
          <TabsContent value="discussions" className="mt-6">
            <FandomDiscussions discussions={mockDiscussions} />
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="mt-6">
            <FandomContent contents={mockContent} />
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="mt-6">
            <FandomEvents events={mockEvents} />
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="mt-6">
            <FandomChat messages={mockMessages} chatId="main-chat" />
          </TabsContent>
        </Tabs>

        {/* Community Features */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-12">Why Join Our Fandom?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  Community Hubs
                </CardTitle>
                <CardDescription>
                  Join or create communities around your favorite IPs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Topic-based communities</li>
                  <li>• Fan clubs and groups</li>
                  <li>• Creator fan pages</li>
                  <li>• Interest-based forums</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">2</span>
                  </div>
                  Content Sharing
                </CardTitle>
                <CardDescription>
                  Share and discover fan-created content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Fan art gallery</li>
                  <li>• Fan fiction</li>
                  <li>• Cosplay photos</li>
                  <li>• Reviews and discussions</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold">3</span>
                  </div>
                  Real-time Interaction
                </CardTitle>
                <CardDescription>
                  Connect with fans in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Live chat rooms</li>
                  <li>• Events and meetups</li>
                  <li>• Q&A sessions</li>
                  <li>• Collaborative projects</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold mb-4">Ready to Join the Fandom?</h3>
          <p className="text-gray-600 mb-6">Become part of Indonesia's largest creative community</p>
          <div className="flex justify-center gap-4">
            <Button size="lg">Join Community</Button>
            <Button variant="outline" size="lg">Create Community</Button>
          </div>
        </div>
      </div>
    </div>
  );
}