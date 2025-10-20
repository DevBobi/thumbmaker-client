"use client";
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AdPreview from '@/components/chat/AdPreview';
import ChatMessageList from '@/components/chat/ChatMessageList';
import ChatInput from '@/components/chat/ChatInput';
import { useChatThread } from '@/hooks/useChatThread';

const ChatThread = () => {
  const { ad, thread, handleSendMessage, handleBack } = useChatThread();

  if (!ad || !thread) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Edit Ad</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ad Preview */}
        <AdPreview ad={ad} />
        
        {/* Chat Interface */}
        <Card className="flex flex-col h-[600px]">
          <CardContent className="p-4 flex-1 overflow-hidden flex flex-col">
            <h3 className="font-medium mb-4">Chat</h3>
            
            {/* Messages Container */}
            <ChatMessageList messages={thread.messages} />
            
            {/* Message Input */}
            <ChatInput onSendMessage={handleSendMessage} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatThread;
