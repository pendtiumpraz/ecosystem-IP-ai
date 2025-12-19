export interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  creatorId: string;
  creatorName: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  rules: string[];
}

export interface Discussion {
  id: string;
  communityId: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  category: string;
  replyCount: number;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
}

export interface Content {
  id: string;
  communityId: string;
  authorId: string;
  authorName: string;
  type: "art" | "fanfic" | "cosplay" | "review" | "other";
  title: string;
  description: string;
  imageUrl: string | null;
  fileUrl: string | null;
  tags: string[];
  likes: number;
  comments: number;
  createdAt: Date;
}

export interface Event {
  id: string;
  communityId: string;
  title: string;
  description: string;
  type: "online" | "offline" | "hybrid";
  date: Date;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  organizerId: string;
  organizerName: string;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: Date;
  isEdited: boolean;
}