"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { Skeleton } from "@/components/ui/skeleton";
import Breadcrumb from "@/components/Breadcrumb";
import { GeneratedThumbnailCard } from "../cards/GeneratedThumbnailCard";
import { io, Socket } from "socket.io-client";

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

const GeneratedThumbnailsPage = ({ id }: { id: string }) => {
  const router = useRouter();
  const { authFetch } = useAuthFetch();
  const [thumbnails, setThumbnails] = useState<GeneratedThumbnail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(false);
  const [setStatus, setSetStatus] = useState<string>("");
  const socketRef = useRef<Socket | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

    // Add a general error handler
    socketRef.current.on('error', (error) => {
      console.error('🔌 WebSocket error:', error);
    });

    // Listen for thumbnail events
    socketRef.current.on('thumbnail:completed', async (data) => {
      console.log('🎉 Thumbnail completed via WebSocket:', data);
      if (data.setId === id) {
        // Fetch the latest data to ensure we have the complete thumbnail set
        try {
          const response = await authFetch(`/api/thumbnails/${id}`);
          if (response.ok) {
            const latestData = await response.json();
            console.log('📊 Latest data after completion:', latestData);
            
            if (latestData.thumbnails) {
              setThumbnails(latestData.thumbnails);
            }
            setSetStatus('COMPLETED');
            setIsProcessing(false);
            setIsLoading(false);
            setError(false);
            // Clear polling since we got the update via WebSocket
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
          }
        } catch (error) {
          console.error('Error fetching latest data after completion:', error);
          // Fallback to WebSocket data
          setThumbnails(data.thumbnails || []);
          setSetStatus('COMPLETED');
          setIsProcessing(false);
          setIsLoading(false);
          setError(false);
          // Clear polling since we got the update via WebSocket
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        }
      }
    });

    socketRef.current.on('thumbnail:failed', (data) => {
      console.log('❌ Thumbnail failed via WebSocket:', data);
      if (data.setId === id) {
        setError(true);
        setIsProcessing(false);
        setIsLoading(false);
        setSetStatus('FAILED');
        // Clear polling since we got the update via WebSocket
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      }
    });

    socketRef.current.on('thumbnail:started', (data) => {
      console.log('🚀 Thumbnail started via WebSocket:', data);
      if (data.setId === id) {
        setIsProcessing(true);
        setIsLoading(false);
        setError(false);
        setSetStatus('PROCESSING');
      }
    });

    // Initial fetch
    fetchThumbnails();

    // Fallback polling in case WebSocket events are missed
    pollIntervalRef.current = setInterval(async () => {
      console.log('🔄 Fallback polling for status update...');
      try {
        const response = await authFetch(`/api/thumbnails/${id}`);
        if (response.ok) {
          const data = await response.json();
          const status = (data.status || "").toString().toUpperCase();
          
          if (status === "COMPLETED" && data.thumbnails && data.thumbnails.length > 0) {
            console.log('✅ Status changed to COMPLETED via polling');
            setThumbnails(data.thumbnails);
            setSetStatus('COMPLETED');
            setIsProcessing(false);
            setIsLoading(false);
            setError(false);
            // Clear polling once completed
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
          } else if (status === "FAILED") {
            console.log('❌ Status changed to FAILED via polling');
            setError(true);
            setIsProcessing(false);
            setIsLoading(false);
            setSetStatus('FAILED');
            // Clear polling once failed
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
          }
        }
      } catch (error) {
        console.error('Error during fallback polling:', error);
      }
    }, 5000); // Poll every 5 seconds

    // Cleanup WebSocket and polling on unmount
    return () => {
      if (socketRef.current) {
        console.log('🔌 Disconnecting WebSocket');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [id, authFetch]);

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

  if (isProcessing || isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-180px)] w-full items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl rounded-2xl border bg-card p-6 shadow-sm sm:p-10">
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">Generating Thumbnails</h1>
              <p className="text-sm text-muted-foreground">
                This may take a moment. You can leave this page and check back later.
              </p>
            </div>
            
            <div className="pt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/dashboard/history')}
                className="text-sm"
              >
                View History
              </Button>
            </div>
          </div>

          <div className="mt-10 space-y-8">
          {thumbnails.length > 0 ? (
            Object.entries(
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
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {ratioThumbnails.map((thumbnail) => (
                      <div key={thumbnail.id}>
                        {thumbnail.status && thumbnail.status.toUpperCase() !== "COMPLETED" ? (
                          <div className="space-y-3">
                            <div className="relative overflow-hidden rounded-lg bg-muted">
                              <Skeleton className="aspect-video w-full" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                              </div>
                            </div>
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
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
              ))
          ) : (
            // Show placeholder skeletons when no thumbnails are loaded yet
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Your thumbnails will appear here</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(1)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="relative overflow-hidden rounded-lg bg-muted">
                      <Skeleton className="aspect-video w-full" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
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
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
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
          <p className="text-muted-foreground mb-4">
            No thumbnails have been generated yet.
          </p>
          <Button onClick={handleBack} variant="outline">
            Return to Dashboard
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
