"use client";
import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  Search,
  X,
  Calendar,
  Files,
  Eye,
  Download,
  Video,
  Palette,
  ExternalLink,
  Plus,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { useDebounce } from "@/hooks/use-debounce";
import Image from "next/image";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import Breadcrumb from "@/components/Breadcrumb";
import Link from "next/link";

const ITEMS_PER_PAGE = 6;

const History = () => {
  const router = useRouter();
  const { authFetch } = useAuthFetch();
  const [campaigns, setCampaigns] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 6,
    totalPages: 0,
  });
  const [selectedThumbnail, setSelectedThumbnail] = useState<any>(null);

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Reset state when component mounts/remounts
  useEffect(() => {
    setIsLoading(true);
    setCampaigns([]);
  }, []);

  // Fetch campaigns when page, search term or filter changes
  useEffect(() => {
    const fetchCampaigns = async () => {
      setIsLoading(true);
      try {
        // Build the API URL with query parameters
        const params = new URLSearchParams();
        params.append("page", currentPage.toString());
        params.append("limit", ITEMS_PER_PAGE.toString());

        if (debouncedSearchTerm) {
          params.append("search", debouncedSearchTerm);
        }

        if (filterBy !== "All") {
          let timeFilter = "all";
          if (filterBy === "Last 7 days") timeFilter = "last7days";
          if (filterBy === "Last 30 days") timeFilter = "last30days";
          params.append("timeFilter", timeFilter);
        }

        const apiUrl = `/api/thumbnails?${params.toString()}`;
        
        const response = await authFetch(apiUrl);
        const data = await response.json();

        if (response.ok) {
          console.log('📊 Fetched campaigns data:', data.data);
          console.log('📷 Sample image URLs:', data.data?.slice(0, 2).map((t: any) => ({ id: t.id, image: t.image })));
          setCampaigns(data.data || []);
          setPagination(
            data.pagination || {
              total: 0,
              page: 1,
              limit: 5,
              totalPages: 0,
            }
          );
        } else {
          console.error("Failed to fetch thumbnails");
        }
      } catch (error) {
        console.error("Error fetching thumbnails:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearchTerm, filterBy]);

  const handleViewThumbnail = (thumbnail: any) => {
    // If it's a single thumbnail with an image, show it in a modal
    if (thumbnail.image) {
      setSelectedThumbnail(thumbnail);
    } else {
      // If it's part of a set, navigate to the set page
      router.push(`/dashboard/generated-thumbnails/${thumbnail.id}`);
    }
  };

  // Function to handle thumbnail download
  const handleDownload = (imageUrl: string, thumbnailTitle: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${thumbnailTitle.replace(/\s+/g, "-").toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to get time ago string
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    return `${diffInDays} days ago`;
  };

  // Handle search with debounce
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Handle filter change
  const handleFilterChange = (value: string) => {
    setFilterBy(value);
    setCurrentPage(1); // Reset to first page on new filter
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setFilterBy("All");
    setCurrentPage(1);
  };

  // Skeleton loader for campaign cards
  const CampaignSkeleton = () => (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center">
        {/* Thumbnail Image Skeleton */}
        <div className="w-64 p-2">
          <Skeleton className="w-full aspect-video rounded-lg" />
        </div>
        
        {/* Content Skeleton */}
        <div className="flex-1 p-4 space-y-3">
          <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full max-w-md" />
            <Skeleton className="h-3 w-full max-w-sm" />
          </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex flex-col gap-2 p-4 border-l border-gray-200">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  );

  // Check if any filters are active
  const hasActiveFilters = searchTerm !== "" || filterBy !== "All";

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "History", href: "/dashboard/history" },
        ]}
      />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Thumbnail History</h1>
          <p className="text-muted-foreground mt-1">
            Browse and manage your generated thumbnails
          </p>
        </div>
      </div>

      {campaigns.length === 0 && !isLoading && !hasActiveFilters ? (
        <Card className="border-dashed border-2">
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
              <div className="p-4 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full">
                <ImageIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">No thumbnails yet</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Start creating thumbnails to see your history here
                </p>
                <Button size="lg" asChild>
                  <Link href="/dashboard/create-youtube-thumbnail">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Thumbnail
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Filter and search controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search thumbnails..."
                className="pl-9 pr-8"
                value={searchTerm}
                onChange={handleSearch}
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    {filterBy} <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleFilterChange("All")}>
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleFilterChange("Last 7 days")}
                  >
                    Last 7 days
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleFilterChange("Last 30 days")}
                  >
                    Last 30 days
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          </div>

          {/* Active filters display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-2">
              {searchTerm && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Search: {searchTerm}
                  <button onClick={clearSearch}>
                    <X className="h-3 w-3 ml-1" />
                  </button>
                </Badge>
              )}
              {filterBy !== "All" && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Time: {filterBy}
                  <button onClick={() => handleFilterChange("All")}>
                    <X className="h-3 w-3 ml-1" />
                  </button>
                </Badge>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <CampaignSkeleton key={i} />
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-muted rounded-full p-3">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-lg">No matching thumbnails</h3>
                  <p className="text-muted-foreground max-w-md">
                    Try adjusting your search or filter criteria
                  </p>
                  <Button variant="outline" className="mt-2" onClick={resetFilters}>
                    Clear all filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-4">
                {campaigns.map((thumbnail: any) => (
                  <div
                    key={thumbnail.id}
                    className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
                  >
                    <div className="flex items-center">
                      {/* Thumbnail Image - Left Side */}
                      <div className="w-64 flex-shrink-0 relative overflow-hidden p-2">
                        {thumbnail.image ? (
                          <Zoom
                            zoomImg={{
                              src: thumbnail.image,
                              alt: thumbnail.title || "Thumbnail preview",
                              width: 800,
                              height: 600,
                            }}
                            zoomMargin={40}
                            classDialog="custom-zoom"
                          >
                            <div className="relative w-full aspect-video">
                              <Image
                                src={thumbnail.image}
                                alt={thumbnail.title || "Thumbnail preview"}
                                fill
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                className="object-contain bg-muted"
                                priority={false}
                                unoptimized
                              />
                            </div>
                          </Zoom>
                        ) : (
                          <div className="w-full aspect-video bg-muted flex items-center justify-center">
                            <span className="text-gray-400 text-sm">No Image</span>
                          </div>
                        )}
                      </div>

                      {/* Content - Middle */}
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        {/* Header Section */}
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900 line-clamp-2 flex-1">
                              {thumbnail.title || `Thumbnail - ${thumbnail.project?.title || "Generated"}`}
                            </h3>
                            <Badge 
                              variant={thumbnail.status === "COMPLETED" ? "default" : "secondary"}
                              className={`shrink-0 ${
                                thumbnail.status === "COMPLETED" 
                                  ? "bg-green-100 text-green-800 border-green-200" 
                                  : "bg-gray-100 text-gray-800 border-gray-200"
                              }`}
                            >
                              {thumbnail.status === "COMPLETED" ? "Success" : "Pending"}
                            </Badge>
                          </div>

                          {/* Metadata */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              <span suppressHydrationWarning>{getTimeAgo(new Date(thumbnail.createdAt))}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Files className="h-3.5 w-3.5" />
                              <span>1 Variant</span>
                            </div>
                            <span className="text-gray-400">
                              ID: {thumbnail.id.slice(-12).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        
                        {/* Project and Template Links */}
                        {(thumbnail.projectId || thumbnail.templateId) && (
                          <div className="flex flex-wrap items-center gap-2">
                            {thumbnail.projectId && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/dashboard/projects?edit=${thumbnail.projectId}`);
                                }}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200 text-xs"
                              >
                                <Video className="h-3 w-3" />
                                <span className="font-medium">Project:</span>
                                <span className="font-mono">{thumbnail.projectId.slice(-8).toUpperCase()}</span>
                                <ExternalLink className="h-2.5 w-2.5" />
                              </button>
                            )}
                            {thumbnail.templateId && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/dashboard/templates?template=${thumbnail.templateId}`);
                                }}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors border border-purple-200 text-xs"
                              >
                                <Palette className="h-3 w-3" />
                                <span className="font-medium">Template:</span>
                                <span className="font-mono">{thumbnail.templateId.toString().padStart(2, '0')}</span>
                                <ExternalLink className="h-2.5 w-2.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons - Right Side */}
                      <div className="flex flex-col items-center justify-center gap-2 p-4 border-l border-gray-200">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1.5 text-xs h-8 px-3 w-full"
                          onClick={() => handleViewThumbnail(thumbnail)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1.5 text-xs h-8 px-3 w-full"
                          onClick={() => handleDownload(thumbnail.image, thumbnail.title || `thumbnail-${thumbnail.id.slice(-8)}`)}
                          disabled={!thumbnail.image}
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination controls */}
              {pagination.totalPages > 1 && (
                <Pagination className="mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                    {Array.from(
                      { length: pagination.totalPages },
                      (_, i) => i + 1
                    ).map((number) => (
                      <PaginationItem key={number}>
                        <PaginationLink
                          isActive={currentPage === number}
                          onClick={() => setCurrentPage(number)}
                        >
                          {number}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage(
                            Math.min(pagination.totalPages, currentPage + 1)
                          )
                        }
                        className={
                          currentPage === pagination.totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </>
      )}

      {/* Thumbnail View Sheet */}
      <Sheet open={!!selectedThumbnail} onOpenChange={() => setSelectedThumbnail(null)}>
        <SheetContent className="w-full sm:max-w-2xl p-0 flex flex-col">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle>
              {selectedThumbnail?.title || `Thumbnail - ${selectedThumbnail?.project?.title || "Preview"}`}
            </SheetTitle>
            <SheetDescription>
              View and download thumbnail details
            </SheetDescription>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {selectedThumbnail && (
              <div className="space-y-6">
                {/* Thumbnail Image */}
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                  <Zoom
                    zoomImg={{
                      src: selectedThumbnail.image,
                      alt: selectedThumbnail.title || "Thumbnail preview",
                      width: 800,
                      height: 600,
                    }}
                    zoomMargin={40}
                    classDialog="custom-zoom"
                  >
                    <div className="relative w-full aspect-video">
                      <Image
                        src={selectedThumbnail.image}
                        alt={selectedThumbnail.title || "Thumbnail preview"}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 60vw"
                        className="object-contain bg-muted"
                        priority={false}
                        unoptimized
                      />
                    </div>
                  </Zoom>
                </div>

                {/* Thumbnail Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Status
                      </p>
                      <Badge 
                        variant={selectedThumbnail.status === "COMPLETED" ? "default" : "secondary"}
                        className={`${
                          selectedThumbnail.status === "COMPLETED" 
                            ? "bg-green-100 text-green-800 border-green-200" 
                            : "bg-gray-100 text-gray-800 border-gray-200"
                        }`}
                      >
                        {selectedThumbnail.status === "COMPLETED" ? "Success" : "Pending"}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Thumbnail ID
                      </p>
                      <p className="text-sm font-mono text-foreground">
                        {selectedThumbnail.id.slice(-12).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Project
                    </p>
                    <p className="text-sm text-foreground">
                      {selectedThumbnail.project?.title || "No Project"}
                    </p>
                  </div>

                  {/* Project ID Link */}
                  {selectedThumbnail.projectId && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Project ID
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          router.push(`/dashboard/projects?edit=${selectedThumbnail.projectId}`);
                          setSelectedThumbnail(null);
                        }}
                        className="w-full justify-start gap-2"
                      >
                        <Video className="h-4 w-4" />
                        <span className="font-mono">{selectedThumbnail.projectId.slice(-8).toUpperCase()}</span>
                        <ExternalLink className="h-3 w-3 ml-auto" />
                      </Button>
                    </div>
                  )}

                  {/* Template ID Link */}
                  {selectedThumbnail.templateId && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Template ID
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          router.push(`/dashboard/templates?template=${selectedThumbnail.templateId}`);
                          setSelectedThumbnail(null);
                        }}
                        className="w-full justify-start gap-2"
                      >
                        <Palette className="h-4 w-4" />
                        <span className="font-mono">Template #{selectedThumbnail.templateId.toString().padStart(2, '0')}</span>
                        <ExternalLink className="h-3 w-3 ml-auto" />
                      </Button>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Created
                    </p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-foreground" suppressHydrationWarning>
                        {getTimeAgo(new Date(selectedThumbnail.createdAt))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons Footer */}
          {selectedThumbnail && (
            <div className="px-6 py-4 border-t mt-auto">
              <div className="flex gap-3">
                <Button
                  onClick={() => handleDownload(selectedThumbnail.image, selectedThumbnail.title || `thumbnail-${selectedThumbnail.id.slice(-8)}`)}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedThumbnail(null)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default History;
