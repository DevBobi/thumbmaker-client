import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAdContext } from "@/contexts/AdContext";
import { ChatThread, GeneratedAd } from "@/types/ad.types";
import { toast } from "@/hooks/use-toast";

export const useChatThread = () => {
  const router = useRouter();
  const params = useParams();
  const adId = params?.adId as string;
  const threadId = params?.threadId as string;
  const { createChatThread, addChatMessage, getGeneratedAd } = useAdContext();
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [ad, setAd] = useState<GeneratedAd | null>(null);

  // Find the ad and create or load a chat thread
  useEffect(() => {
    if (adId) {
      const foundAd = getGeneratedAd(adId);
      if (foundAd) {
        setAd(foundAd);

        // If threadId is provided, find the existing thread
        if (threadId) {
          const existingThread = foundAd.chatThreads.find(
            (t) => t.id === threadId
          );
          if (existingThread) {
            setThread(existingThread);
          } else {
            // Thread not found, go back to generated ads
            toast({
              title: "Thread not found",
              description: "The chat thread could not be found.",
              variant: "destructive",
            });
            router.push("/generated-ads");
          }
        } else {
          // Create a new thread
          const newThread = createChatThread(
            adId,
            `Edit ${new Date().toLocaleString()}`
          );
          setThread(newThread);
        }
      } else {
        // Ad not found, go back to generated ads
        toast({
          title: "Ad not found",
          description: "The ad could not be found.",
          variant: "destructive",
        });
        router.push("/generated-ads");
      }
    }
  }, [adId, threadId, getGeneratedAd, createChatThread, router]);

  const handleSendMessage = (message: string) => {
    if (!adId || !thread) return;

    // Add user message
    addChatMessage(adId, thread.id, {
      sender: "user",
      content: message,
      timestamp: new Date(),
    });

    // Simulate system response (in a real app, this would call an AI service)
    setTimeout(() => {
      addChatMessage(adId, thread.id, {
        sender: "system",
        content: `I've processed your request: "${message}". Here's the updated ad.`,
        timestamp: new Date(),
      });
    }, 1000);
  };

  const handleBack = () => {
    router.push("/generated-ads");
  };

  return {
    ad,
    thread,
    handleSendMessage,
    handleBack,
  };
};
