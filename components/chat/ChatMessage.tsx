
import React from 'react';
import { ChatMessage as ChatMessageType } from '@/types/ad.types';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[80%] rounded-lg p-3 ${
          message.sender === 'user' 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-accent'
        }`}
      >
        <p className="text-sm">{message.content}</p>
        <p className="text-xs opacity-70 mt-1 text-right">
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
