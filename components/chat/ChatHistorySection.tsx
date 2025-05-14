import React from "react";
import { MessageSquare, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChatThread } from "@/types/ad.types";

type ChatThreadWithAdInfo = {
  thread: ChatThread;
  adId: string;
  adImageUrl: string;
};

interface ChatHistorySectionProps {
  chatThreadsWithAdInfo: ChatThreadWithAdInfo[];
  onViewThread: (threadId: string) => void;
}

const ChatHistorySection = ({
  chatThreadsWithAdInfo,
  onViewThread,
}: ChatHistorySectionProps) => {
  // Get message preview - first user message or system prompt
  const getMessagePreview = (thread: ChatThread): string => {
    // Find the first user message, if any
    const userMessage = thread.messages.find((msg) => msg.sender === "user");
    if (userMessage) {
      return userMessage.content.length > 60
        ? `${userMessage.content.substring(0, 60)}...`
        : userMessage.content;
    }
    // Otherwise use the first message
    return thread.messages[0]?.content.length > 60
      ? `${thread.messages[0]?.content.substring(0, 60)}...`
      : thread.messages[0]?.content || "No messages";
  };

  // Get time ago string (e.g., "1d ago")
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "1d ago";
    return `${diffInDays}d ago`;
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Chat History
        </h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {chatThreadsWithAdInfo.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No chat history available yet.
            </p>
          ) : (
            <div className="space-y-2">
              {chatThreadsWithAdInfo.map(({ thread, adImageUrl }) => (
                <div
                  key={thread.id}
                  className="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent/5 transition-colors"
                  onClick={() => onViewThread(thread.id)}
                >
                  {/* Icon or thumbnail */}
                  <div className="h-10 w-10 rounded-md border overflow-hidden flex-shrink-0">
                    <img
                      src={adImageUrl}
                      alt="Ad thumbnail"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Content - simplified to just show message preview and timestamp */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground truncate">
                      {getMessagePreview(thread)}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {getTimeAgo(thread.updatedAt)}
                    </span>
                  </div>

                  {/* Action button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewThread(thread.id);
                    }}
                  >
                    View <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatHistorySection;
