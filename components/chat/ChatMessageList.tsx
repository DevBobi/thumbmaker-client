
import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage as ChatMessageType } from '@/types/ad.types';
import ChatMessage from './ChatMessage';

interface ChatMessageListProps {
  messages: ChatMessageType[];
}

const ChatMessageList = ({ messages }: ChatMessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <ScrollArea className="flex-1 pr-4">
      <div className="space-y-4">
        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default ChatMessageList;
