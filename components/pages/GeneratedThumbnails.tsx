"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { Skeleton } from "@/components/ui/skeleton";
import Breadcrumb from "@/components/Breadcrumb";
import { GeneratedThumbnailCard } from "../cards/GeneratedThumbnailCard";

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

  useEffect(() => {
    const fetchThumbnails = async () => {
      try {
        const response = await authFetch(`/api/thumbnails/${id}`);
        const data: ThumbnailSet = await response.json();

        if (!data) {
          throw new Error("No data received");
        }

        // Format thumbnails from the set
        const formattedThumbnails = data.thumbnails || [];

        setThumbnails(formattedThumbnails);
        setIsProcessing(data.status !== "COMPLETED");
        setIsLoading(false);

        // If status is not completed, continue polling
        return data.status !== "COMPLETED";
      } catch (error) {
        console.error("Error fetching thumbnails:", error);
        setError(true);
        setIsProcessing(false);
        setIsLoading(false);
        return false; // Stop polling on error
      }
    };

    // Initial fetch
    fetchThumbnails();

    // Set up polling if needed
    const intervalId = setInterval(async () => {
      const shouldContinuePolling = await fetchThumbnails();
      if (!shouldContinuePolling) {
        clearInterval(intervalId);
      }
    }, 5000);

    // Cleanup
    return () => {
      clearInterval(intervalId);
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
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-500">Failed to load generated thumbnails.</p>
        <Button onClick={handleBack} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
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
