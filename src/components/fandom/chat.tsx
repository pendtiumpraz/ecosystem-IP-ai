import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/types/fandom";

interface FandomChatProps {
  messages: ChatMessage[];
  chatId: string;
}

export function FandomChat({ messages, chatId }: FandomChatProps) {
  const [message, setMessage] = useState("");

  return (
    <div className="space-y-6">
      {/* Chat Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Live Chat - {chatId}</CardTitle>
            <Badge variant="outline">Active</Badge>
          </div>
          <CardDescription>
            Real-time chat with fellow community members
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Messages */}
      <Card>
        <CardContent className="h-96">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4">
              {messages.map(msg => (
                <ChatMessageItem key={msg.id} message={msg} />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Message Input */}
      <div className="flex gap-2">
        <Input
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1"
        />
        <Button>Send</Button>
      </div>
    </div>
  );
}

function ChatMessageItem({ message }: { message: ChatMessage }) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{message.authorName}</span>
          <span className="text-xs text-gray-500">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>
        <p className="text-sm text-gray-700">{message.content}</p>
      </div>
    </div>
  );
}