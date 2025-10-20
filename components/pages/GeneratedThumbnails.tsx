"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Skeleton } from "@/components/ui/skeleton";
import Breadcrumb from "@/components/Breadcrumb";
import { GeneratedThumbnailCard } from "../cards/GeneratedThumbnailCard";
import { io, Socket } from "socket.io-client";

// Mock data for development
const MOCK_THUMBNAILS = [
  {
    id: "1",
    title: "Gaming Thumbnail 1",
    description: "Epic gaming moment captured",
    aspectRatio: "16:9",
    image: "https://picsum.photos/1281/721",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Gaming Thumbnail 2",
    description: "Intense battle scene",
    aspectRatio: "16:9",
    image: "https://picsum.photos/1280/721",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Gaming Thumbnail 3",
    description: "Victory celebration",
    aspectRatio: "16:9",
    image: "https://picsum.photos/1289/720",
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    title: "Gaming Thumbnail 4",
    description: "Team strategy moment",
    aspectRatio: "16:9",
    image: "https://picsum.photos/1255/720",
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    title: "Gaming Thumbnail 5",
    description: "Character showcase",
    aspectRatio: "16:9",
    image: "https://picsum.photos/1280/726",
    createdAt: new Date().toISOString(),
  },
];

interface GeneratedThumbnail {
  id: string;
  title: string;
  description: string;
  aspectRatio: string;
  image: string;
  createdAt: string;
  jobId?: string;
  status?: string;
  progress?: number;
}

interface ThumbnailSet {
  id: string;
  name: string;
  status: string;
  thumbnails: GeneratedThumbnail[];
}

const GeneratedThumbnailsPage = ({ id }: { id: string }) => {
  const router = useRouter();
  const { authFetch } = useAuthFetch();
  const [thumbnails, setThumbnails] = useState<GeneratedThumbnail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(false);
  const [setStatus, setSetStatus] = useState<string>("");
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const fetchThumbnails = async () => {
      try {
        const response = await authFetch(`/api/thumbnails/${id}`);
        
        console.log('📊 API Response status:', response.status);
        console.log('📊 API Response headers:', response.headers);
        
        if (!response.ok) {
          console.error('❌ API Error:', response.status, response.statusText);
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        const data: any = await response.json();

        console.log('📊 Fetched thumbnail data:', data);

        if (!data) {
          throw new Error("No data received");
        }

        // Handle both single thumbnail and thumbnail set responses
        let formattedThumbnails: GeneratedThumbnail[] = [];
        // Normalize status to uppercase when present
        let status = (data.status || "").toString().toUpperCase();

        if (data.thumbnails) {
          // It's a thumbnail set
          formattedThumbnails = data.thumbnails || [];
          status = (data.status || status || "").toString().toUpperCase() || "";
        } else if (data.image) {
          // It's a single thumbnail - always treat as completed if we have the image
          formattedThumbnails = [data];
          status = (data.status || status || "COMPLETED").toString().toUpperCase();
        } else if (Array.isArray(data)) {
          // It's an array of thumbnails
          formattedThumbnails = data;
          status = "COMPLETED";
        } else if (data.id && data.image) {
          // Single thumbnail object
          formattedThumbnails = [data];
          status = (data.status || status || "COMPLETED").toString().toUpperCase();
        } else {
          // Fallback - treat the entire data as a single thumbnail if it has required fields
          console.log('⚠️ Unexpected data format, treating as single thumbnail:', data);
          if (data.title || data.image) {
            formattedThumbnails = [data];
            status = "COMPLETED";
          }
        }

        console.log('📊 Status:', status, 'Thumbnails count:', formattedThumbnails.length);

        setThumbnails(formattedThumbnails);
        setSetStatus(status);
        
        // Check if processing or failed
        if (status === "FAILED") {
          setError(true);
          setIsProcessing(false);
          setIsLoading(false);
          return false; // Stop polling on failure
        }
        
        // Show processing UI for any non-completed, non-failed status (e.g., QUEUED, PENDING, PROCESSING)
        let shouldProcess = status !== "COMPLETED" && status !== "FAILED";
        // If we have no thumbnails yet and not failed, we are still processing
        if (formattedThumbnails.length === 0 && status !== "FAILED") {
          shouldProcess = true;
        }
        setIsProcessing(shouldProcess);
        setIsLoading(false);

        // If status is not completed, continue polling
        return status !== "COMPLETED";
      } catch (error) {
        console.error("Error fetching thumbnails:", error);
        setError(true);
        setIsProcessing(false);
        setIsLoading(false);
        return false; // Stop polling on error
      }
    };

    // Setup WebSocket connection
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    console.log('🔌 Connecting to WebSocket:', apiUrl);
    
    socketRef.current = io(apiUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    socketRef.current.on('connect', () => {
      console.log('🔌 WebSocket connected:', socketRef.current?.id);
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error);
    });

    // Listen for thumbnail events
    socketRef.current.on('thumbnail:completed', (data) => {
      console.log('🎉 Thumbnail completed via WebSocket:', data);
      if (data.setId === id) {
        setThumbnails(data.thumbnails || []);
        setSetStatus('COMPLETED');
        setIsProcessing(false);
        setIsLoading(false);
        setError(false);
      }
    });

    socketRef.current.on('thumbnail:failed', (data) => {
      console.log('❌ Thumbnail failed via WebSocket:', data);
      if (data.setId === id) {
        setError(true);
        setIsProcessing(false);
        setIsLoading(false);
      }
    });

    socketRef.current.on('thumbnail:started', (data) => {
      console.log('🚀 Thumbnail started via WebSocket:', data);
      if (data.setId === id) {
        setIsProcessing(true);
        setIsLoading(false);
      }
    });

    // Initial fetch only (no more aggressive polling)
    fetchThumbnails();

    // Cleanup WebSocket on unmount
    return () => {
      if (socketRef.current) {
        console.log('🔌 Disconnecting WebSocket');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [id]);

  const handleDownload = (imageUrl: string, title: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${title.replace(/\s+/g, "-").toLowerCase()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBack = () => {
    router.push("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            {
              label: "Generated Thumbnails",
              href: `/dashboard/generated-thumbnails`,
            },
          ]}
        />

        <h1 className="text-2xl font-bold">Loading Your Thumbnails...</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="overflow-hidden ">
              <div className="p-0">
                <Skeleton className="aspect-square w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="mx-auto space-y-6">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            {
              label: "Generated Thumbnails",
              href: `/dashboard/generated-thumbnails`,
            },
          ]}
        />
        <div className="flex items-center">
          <h1 className="text-2xl font-bold mr-2">Generating Thumbnails</h1>
          <div className="flex space-x-1">
            <span className="animate-bounce delay-0">.</span>
            <span className="animate-bounce delay-150">.</span>
            <span className="animate-bounce delay-300">.</span>
          </div>
        </div>
        <p>
          Thumbnails are being generated. The workflow is complex and requires
          time. Thanks for your patience.
        </p>

        <div className="space-y-8">
          {Object.entries(
            thumbnails.reduce(
              (acc: Record<string, GeneratedThumbnail[]>, thumbnail) => {
                const ratio = thumbnail.aspectRatio || "";
                if (!acc[ratio]) acc[ratio] = [];
                acc[ratio].push(thumbnail);
                return acc;
              },
              {}
            )
          )
            .sort(([ratioA], [ratioB]) => {
              // Define the order of aspect ratios
              const order: Record<string, number> = {
                "1:1": 1,
                "2:3": 2,
                "3:2": 3,
              };
              return (order[ratioA] || 999) - (order[ratioB] || 999);
            })
            .map(([ratio, ratioThumbnails]) => (
              <div key={ratio} className="space-y-4">
                <h2 className="text-lg font-semibold">
                  {ratio === "1:1" || ratio === "2:3" || ratio === "3:2"
                    ? "Original"
                    : `Thumbnails ${ratio}`}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ratioThumbnails.map((thumbnail) => (
                    <div key={thumbnail.id}>
                      {thumbnail.status ? (
                        <div className="flex flex-col space-y-3">
                          <div className="overflow-hidden rounded-md">
                            <Skeleton className="aspect-[4/5] w-full flex items-center justify-center">
                              <Loader2 className="h-5 w-5 animate-spin" />
                            </Skeleton>
                          </div>
                        </div>
                      ) : (
                        <GeneratedThumbnailCard
                          download={() =>
                            handleDownload(thumbnail.image, thumbnail.title)
                          }
                          key={thumbnail.id}
                          ad={thumbnail}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto space-y-6">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            {
              label: "Generated Thumbnails",
              href: `/dashboard/generated-thumbnails`,
            },
          ]}
        />
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4 text-red-700">Generation Failed</h1>
          <p className="text-red-600 mb-4">
            {setStatus === "FAILED" 
              ? "The thumbnail generation process failed. This could be due to insufficient credits, API errors, or invalid inputs."
              : "Failed to load generated thumbnails."}
          </p>
          <div className="space-y-2 mb-4 text-sm text-red-600">
            <p>• Check if you have sufficient credits</p>
            <p>• Verify your API keys are configured correctly</p>
            <p>• Try generating again with different settings</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
            <Button onClick={() => window.location.href = "/dashboard/create-youtube-thumbnail"} variant="default">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          {
            label: "Generated Thumbnails",
            href: `/dashboard/generated-thumbnails`,
          },
        ]}
      />
      <h1 className="text-2xl font-bold">Your Generated Thumbnails</h1>

      {thumbnails.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            No thumbnails have been generated yet.
          </p>
          <Button onClick={handleBack} variant="outline">
            Return to Dashboard
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {thumbnails.map((thumbnail) => (
            <GeneratedThumbnailCard
              download={() => handleDownload(thumbnail.image, thumbnail.title)}
              key={thumbnail.id}
              ad={thumbnail}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GeneratedThumbnailsPage;
