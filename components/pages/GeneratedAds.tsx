"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { Skeleton } from "@/components/ui/skeleton";
import { GeneratedAdCard } from "@/components/cards/GeneratedAdCard";
import Breadcrumb from "@/components/Breadcrumb";

interface GeneratedAd {
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

const GeneratedAdsPage = () => {
  const router = useRouter();
  const { authFetch } = useAuthFetch();
  const params = useParams();
  const campaignId = params?.id as string;
  const [ads, setAds] = useState<GeneratedAd[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await authFetch(`/ads/${campaignId}`);
        const data = await response.json();

        const formattedAds = data.ads.map((ad: any) => ({
          id: ad.id,
          title: ad.title || "Untitled Ad",
          description: ad.description || "",
          aspectRatio: ad.aspectRatio || "",
          image: ad.image,
          createdAt: ad.createdAt || new Date().toISOString(),
        }));

        // Add loading states for pending jobs
        const pendingJobs = data.jobStatuses
          .filter(
            (job: any) => job.status === "active" || job.status === "waiting"
          )
          .map((job: any) => ({
            id: `pending-${job.jobId}`,
            title: "Generating Ad...",
            description: "",
            aspectRatio: "",
            image: "",
            createdAt: new Date().toISOString(),
            jobId: job.jobId,
            status: job.status,
            progress: job.progress,
          }));

        setAds([...formattedAds, ...pendingJobs]);
        setIsProcessing(pendingJobs.length > 0);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching ads:", error);
        setError(true);
        setIsProcessing(false);
        setIsLoading(false);
      }
    };

    fetchAds();
    const intervalId = setInterval(fetchAds, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [campaignId, authFetch]);

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
              label: "Generated Ads",
              href: `/dashboard/generated-ads`,
            },
          ]}
        />

        <h1 className="text-2xl font-bold">Loading Your Ads...</h1>
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
            { label: "Generated Ads", href: `/dashboard/generated-ads` },
          ]}
        />
        <div className="flex items-center">
          <h1 className="text-2xl font-bold mr-2">Generating Ads</h1>
          <div className="flex space-x-1">
            <span className="animate-bounce delay-0">.</span>
            <span className="animate-bounce delay-150">.</span>
            <span className="animate-bounce delay-300">.</span>
          </div>
        </div>
        <p>
          Ads are being generated. The workflow is complex and requires time.
          Thanks for your patience.
        </p>

        <div className="space-y-8">
          {Object.entries(
            ads.reduce((acc, ad) => {
              const ratio = ad.aspectRatio || "";
              if (!acc[ratio]) acc[ratio] = [];
              acc[ratio].push(ad);
              return acc;
            }, {} as Record<string, GeneratedAd[]>)
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
            .map(([ratio, ratioAds]) => (
              <div key={ratio} className="space-y-4">
                <h2 className="text-lg font-semibold">
                  {ratio === "1:1" || ratio === "2:3" || ratio === "3:2"
                    ? "Original"
                    : `Ads ${ratio}`}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ratioAds.map((ad) => (
                    <div key={ad.id}>
                      {ad.status ? (
                        <div className="flex flex-col space-y-3">
                          <div className="overflow-hidden rounded-md">
                            <Skeleton className="aspect-[4/5] w-full flex items-center justify-center">
                              <Loader2 className="h-5 w-5 animate-spin" />
                            </Skeleton>
                          </div>
                        </div>
                      ) : (
                        <GeneratedAdCard
                          download={() => handleDownload(ad.image, ad.title)}
                          key={ad.id}
                          ad={ad}
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
            { label: "Generated Ads", href: `/dashboard/generated-ads` },
          ]}
        />
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-500">Failed to load generated ads.</p>
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
          { label: "Generated Ads", href: `/dashboard/generated-ads` },
        ]}
      />
      <h1 className="text-2xl font-bold">Your Generated Ads</h1>

      {ads.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No ads have been generated yet.</p>
          <Button onClick={handleBack} variant="outline">
            Return to Dashboard
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(
            ads.reduce((acc, ad) => {
              const ratio = ad.aspectRatio || "";
              if (!acc[ratio]) acc[ratio] = [];
              acc[ratio].push(ad);
              return acc;
            }, {} as Record<string, GeneratedAd[]>)
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
            .map(([ratio, ratioAds]) => (
              <div key={ratio} className="space-y-4">
                <h2 className="text-lg font-semibold">
                  {ratio === "1:1" || ratio === "2:3" || ratio === "3:2"
                    ? "Original"
                    : `Ads (${ratio})`}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ratioAds.map((ad) => (
                    <GeneratedAdCard
                      download={() => handleDownload(ad.image, ad.title)}
                      key={ad.id}
                      ad={ad}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default GeneratedAdsPage;
