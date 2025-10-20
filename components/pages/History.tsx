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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { useDebounce } from "@/hooks/use-debounce";
import Image from "next/image";
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
import Breadcrumb from "@/components/Breadcrumb";

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
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="flex">
        {/* Thumbnail Image Skeleton */}
        <Skeleton className="w-48 h-32 rounded-l-lg" />
        
        {/* Content Skeleton */}
        <div className="flex-1 p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="flex gap-2 ml-4">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
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
          { label: "Campaign History", href: "/dashboard/history" },
        ]}
      />
      <div>
        <h1 className="text-3xl font-bold">Thumbnail History</h1>
        <p className="text-muted-foreground">
          Browse and manage your generated thumbnails
        </p>
      </div>

      {campaigns.length === 0 && !isLoading && !hasActiveFilters ? (
        <div className="p-12 text-center bg-muted/30 rounded-lg border border-border">
          <h3 className="text-xl font-medium text-muted-foreground">
            No thumbnails yet
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Start creating thumbnails to see your history here
          </p>
        </div>
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
            <div className="p-12 text-center bg-muted/30 rounded-lg border border-border">
              <h3 className="text-xl font-medium text-muted-foreground">
                No matching thumbnails
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your search or filter criteria
              </p>
              <Button variant="outline" className="mt-4" onClick={resetFilters}>
                Clear all filters
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {campaigns.map((thumbnail: any) => (
                  <div
                    key={thumbnail.id}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex">
                      {/* Thumbnail Image - Left Side */}
                      <div className="w-48 h-32 relative rounded-l-lg overflow-hidden bg-gray-100">
                        {thumbnail.image ? (
                          <Image
                            src={thumbnail.image}
                            alt={thumbnail.title || "Thumbnail preview"}
                            fill
                            className="object-cover"
                            unoptimized
                            onError={(e) => {
                              console.error('❌ Image failed to load:', thumbnail.image);
                              console.error('❌ Error:', e);
                            }}
                            onLoad={() => {
                              console.log('✅ Image loaded successfully:', thumbnail.image);
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-400 text-sm">No Image</span>
                          </div>
                        )}
                      </div>

                      {/* Content - Right Side */}
                      <div className="flex-1 p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            {/* Title and Status */}
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {thumbnail.title || "Thumbnail Generated"}
                              </h3>
                              <Badge 
                                variant={thumbnail.status === "COMPLETED" ? "default" : "secondary"}
                                className={`${
                                  thumbnail.status === "COMPLETED" 
                                    ? "bg-green-100 text-green-800 border-green-200" 
                                    : "bg-gray-100 text-gray-800 border-gray-200"
                                }`}
                              >
                                {thumbnail.status === "COMPLETED" ? "Success" : "Pending"}
                              </Badge>
                            </div>

                            {/* Series/Category */}
                            <p className="text-sm text-gray-600 mb-1">
                              {thumbnail.project?.title || "Tech Review Series"}
                            </p>

                            {/* ID */}
                            <p className="text-sm text-gray-500 mb-3">
                              ID: {thumbnail.id.slice(-12).toUpperCase()}
                            </p>

                            {/* Date and Variants */}
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span suppressHydrationWarning>{getTimeAgo(new Date(thumbnail.createdAt))}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Files className="h-4 w-4" />
                                <span>1 Variant</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                              onClick={() => handleViewThumbnail(thumbnail)}
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                              onClick={() => handleDownload(thumbnail.image, thumbnail.title || `thumbnail-${thumbnail.id.slice(-8)}`)}
                              disabled={!thumbnail.image}
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </Button>
                          </div>
                        </div>
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
              {selectedThumbnail?.title || "Thumbnail Preview"}
            </SheetTitle>
            <SheetDescription>
              View and download thumbnail details
            </SheetDescription>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {selectedThumbnail && (
              <div className="space-y-6">
                {/* Thumbnail Image */}
                <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden border">
                  <Image
                    src={selectedThumbnail.image}
                    alt={selectedThumbnail.title || "Thumbnail preview"}
                    fill
                    className="object-contain"
                    unoptimized
                  />
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
