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
import { useGenerationProgress } from "@/hooks/use-generation-progress";
import { emitCreditsUpdated } from "@/lib/credit-events";

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
  const [error, setError] = useState<{
    code?: number;
    message?: string;
    details?: string;
    kind?: "failed" | "not_found" | "network";
  } | null>(null);
  const [setStatus, setSetStatus] = useState<string>("");
  const socketRef = useRef<Socket | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const creditsUpdatedRef = useRef(false); // Track if we've already emitted credit update
  const { progress: genProgress } = useGenerationProgress(id);

  useEffect(() => {
    const fetchThumbnails = async () => {
      try {
        const response = await authFetch(`/thumbnails/${id}`);
        
        console.log('📊 API Response status:', response.status);
        console.log('📊 API Response headers:', response.headers);
        
        if (!response.ok) {
          console.error('❌ API Error:', response.status, response.statusText);

          // Try to get more context from the response body
          let body: any = null;
          try {
            body = await response.json();
          } catch {
            // ignore parse error, we'll fall back to status text
          }

          if (response.status === 404) {
            setError({
              code: 404,
              kind: "not_found",
              message:
                body?.message ||
                "We couldn’t find a generation batch for this link. Make sure you’re using the batch link we show after generation, or open it from your History page.",
            });
          } else {
            setError({
              code: response.status,
              kind: "network",
              message:
                body?.message ||
                body?.error ||
                `Request failed with status ${response.status} ${response.statusText}`,
            });
          }

          setIsProcessing(false);
          setIsLoading(false);
          return false;
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
        
        // Emit credit update event when generation completes
        if (status === "COMPLETED" && !creditsUpdatedRef.current) {
          emitCreditsUpdated();
          creditsUpdatedRef.current = true;
        }
        
        // Check if processing or failed
        if (status === "FAILED") {
          // Mark as a graceful failure but keep any partial thumbnails visible
          setError({
            kind: "failed",
            message:
              "This generation batch was marked as failed. Any thumbnails that did complete are shown below, and credits for failed items should have been refunded.",
          });
          setIsProcessing(false);
          setIsLoading(false);
          return false; // Stop polling on failure
        }
        
        // Show processing UI for any non-completed, non-failed status (e.g., QUEUED, PENDING, PROCESSING)
        let shouldProcess = status !== "COMPLETED" && status !== "FAILED";
        
        // Also check if we're expecting more thumbnails based on progress
        // If we have progress data, use it to determine if we're still processing
        if (genProgress && genProgress.total > 0) {
          shouldProcess = genProgress.completed < genProgress.total && !genProgress.isCompleted;
        } else {
          // If we have no thumbnails yet and not failed, we are still processing
          if (formattedThumbnails.length === 0 && status !== "FAILED") {
            shouldProcess = true;
          }
          // If status is PENDING or PROCESSING, we're still processing
          if (status === "PENDING" || status === "PROCESSING") {
            shouldProcess = true;
          }
        }
        
        setIsProcessing(shouldProcess);
        setIsLoading(false);

        // If status is not completed, continue polling
        return status !== "COMPLETED";
      } catch (error: any) {
        console.error("Error fetching thumbnails:", error);
        setError((prev) => {
          if (prev) return prev;
          return {
            kind: "network",
            message:
              error?.message ||
              "We couldn’t load this generation batch. Please check your connection and try again, or open the thumbnails from your History page.",
          };
        });
        setIsProcessing(false);
        setIsLoading(false);
        return false; // Stop polling on error
      }
    };

    // Setup WebSocket connection
    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    // Strip trailing /api if present so Socket.IO connects to the server origin, not the REST base path
    const socketUrl = rawApiUrl.replace(/\/api\/?$/, '');
    console.log('🔌 Connecting to WebSocket:', socketUrl);
    
    socketRef.current = io(socketUrl, {
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
          const response = await authFetch(`/thumbnails/${id}`);
          if (response.ok) {
            const latestData = await response.json();
            console.log('📊 Latest data after completion:', latestData);
            
            if (latestData.thumbnails) {
              setThumbnails(latestData.thumbnails);
            }
            setSetStatus('COMPLETED');
            setIsProcessing(false);
            setIsLoading(false);
            setError(null);
            // Emit credit update event to refresh navbar credits
            if (!creditsUpdatedRef.current) {
              emitCreditsUpdated();
              creditsUpdatedRef.current = true;
            }
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
          setError(null);
          // Emit credit update event to refresh navbar credits
          if (!creditsUpdatedRef.current) {
            emitCreditsUpdated();
            creditsUpdatedRef.current = true;
          }
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
        setError({
          kind: "failed",
          message:
            data?.error ||
            "This generation batch failed while processing. You can try again from the History page; any credits for the failed batch should be refunded automatically.",
          details: data?.errorDetails,
        });
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
        setError(null);
        setSetStatus('PROCESSING');
      }
    });

    // Initial fetch
    fetchThumbnails();

    // Fallback polling in case WebSocket events are missed
    pollIntervalRef.current = setInterval(async () => {
      console.log('🔄 Fallback polling for status update...');
      try {
        const response = await authFetch(`/thumbnails/${id}`);
        if (response.ok) {
          const data = await response.json();
          const status = (data.status || "").toString().toUpperCase();
          
          if (status === "COMPLETED" && data.thumbnails && data.thumbnails.length > 0) {
            console.log('✅ Status changed to COMPLETED via polling');
            setThumbnails(data.thumbnails);
            setSetStatus('COMPLETED');
            // Emit credit update event to refresh navbar credits
            if (!creditsUpdatedRef.current) {
              emitCreditsUpdated();
              creditsUpdatedRef.current = true;
            }
            setIsProcessing(false);
            setIsLoading(false);
            setError(null);
            // Clear polling once completed
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
          } else if (status === "FAILED") {
            console.log('❌ Status changed to FAILED via polling');
            // If any thumbnail in this set has an error message, surface the first one
            let details: string | undefined;
            if (Array.isArray(data.thumbnails)) {
              const firstWithError = data.thumbnails.find(
                (t: any) => typeof t.error === "string" && t.error.length > 0
              );
              if (firstWithError) {
                details = firstWithError.error;
              }
            }

            setError({
              kind: "failed",
              message:
                "This generation batch was marked as failed. Any thumbnails that did complete are shown below, and credits for failed items should have been refunded.",
              details,
            });
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
  }, [id, authFetch, genProgress]);

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
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Generating Thumbnails</h1>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/dashboard/history')}
            >
              View History
            </Button>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              <strong>💡 You can leave this page anytime.</strong> Your thumbnails will continue generating in the background. Check back later in your{" "}
              <button
                onClick={() => router.push('/dashboard/history')}
                className="underline font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                History
              </button>
              {" "}to see them when they're ready.
            </p>
          </div>
        </div>

        {/* Show thumbnails in the same grid layout as completed state */}
        {thumbnails.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {thumbnails.map((thumbnail) => (
              <div key={thumbnail.id}>
                {thumbnail.status && thumbnail.status.toUpperCase() !== "COMPLETED" ? (
                  <div className="relative border rounded-md overflow-hidden bg-muted">
                    <div className="relative w-full aspect-[4/3]">
                      <Skeleton className="w-full h-full" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    </div>
                    <div className="p-3 bg-background">
                      <Skeleton className="h-10 w-10 rounded-md" />
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
            {/* Show remaining skeleton placeholders for thumbnails not yet generated */}
            {thumbnails.length < (genProgress.total || 1) && 
              [...Array((genProgress.total || 1) - thumbnails.length)].map((_, i) => (
                <div key={`skeleton-${i}`} className="relative border rounded-md overflow-hidden bg-muted">
                  <div className="relative w-full aspect-[4/3]">
                    <Skeleton className="w-full h-full" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  </div>
                  <div className="p-3 bg-background">
                    <Skeleton className="h-10 w-10 rounded-md" />
                  </div>
                </div>
              ))
            }
          </div>
        ) : (
          // Show placeholder skeletons when no thumbnails are loaded yet
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(Math.max(genProgress.total || 1, 1))].map((_, i) => (
              <div key={i} className="relative border rounded-md overflow-hidden bg-muted">
                <div className="relative w-full aspect-[4/3]">
                  <Skeleton className="w-full h-full" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                </div>
                <div className="p-3 bg-background">
                  <Skeleton className="h-10 w-10 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        )}
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 space-y-4">
          <div>
            <h1 className="text-2xl font-bold mb-2 text-red-700">
              {error.kind === "not_found"
                ? "Generation batch not found"
                : "Generation issue"}
            </h1>
            <p className="text-red-600 mb-2">
              {error.message ||
                (setStatus === "FAILED"
                  ? "The thumbnail generation process failed. This could be due to upstream AI errors or invalid inputs."
                  : "We couldn’t load generated thumbnails for this link.")}
            </p>
          </div>

          {error.details && (
            <div className="rounded-md bg-red-100 border border-red-200 px-3 py-2 text-xs text-red-700 whitespace-pre-line">
              {error.details}
            </div>
          )}

          {error.kind === "not_found" && (
            <div className="space-y-1 text-sm text-red-600">
              <p>• This page expects a <strong>batch ID</strong> (set ID), not a single thumbnail ID.</p>
              <p>• Open the same batch from your <strong>History</strong> page, or trigger a new generation and follow the redirect link.</p>
            </div>
          )}

          {error.kind !== "not_found" && (
            <div className="space-y-1 text-sm text-red-600">
              <p>• Check your connection and try refreshing this page.</p>
              <p>• If this keeps happening, open the thumbnails from your <strong>History</strong> page instead.</p>
            </div>
          )}

          {thumbnails.length > 0 && (
            <div className="mt-4 border-t border-red-100 pt-4">
              <p className="text-sm font-medium text-red-700 mb-2">
                Partial results
              </p>
              <p className="text-xs text-red-600 mb-3">
                We still found {thumbnails.length} thumbnail
                {thumbnails.length > 1 ? "s" : ""} in this batch. You can download them below.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {thumbnails.map((thumbnail) => (
                  <GeneratedThumbnailCard
                    key={thumbnail.id}
                    ad={thumbnail}
                    download={() =>
                      handleDownload(thumbnail.image, thumbnail.title)
                    }
                  />
                ))}
              </div>
            </div>
          )}

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
