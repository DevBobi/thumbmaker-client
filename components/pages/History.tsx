"use client";
import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
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
import Breadcrumb from "@/components/Breadcrumb";
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

  // Function to build the API URL with query parameters
  const buildApiUrl = () => {
    const params = new URLSearchParams();
    params.append("page", currentPage.toString());
    params.append("limit", pagination.limit.toString());

    if (searchTerm) {
      params.append("search", searchTerm);
    }

    if (filterBy !== "All") {
      let timeFilter = "all";
      if (filterBy === "Last 7 days") timeFilter = "last7days";
      if (filterBy === "Last 30 days") timeFilter = "last30days";
      params.append("timeFilter", timeFilter);
    }

    return `/api/ads/campaigns?${params.toString()}`;
  };

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const response = await authFetch(buildApiUrl());
      const data = await response.json();

      if (response.ok) {
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
        console.error("Failed to fetch campaigns");
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch campaigns when page, search term or filter changes
  useEffect(() => {
    fetchCampaigns();
  }, [currentPage, searchTerm, filterBy]);

  const handleViewCampaign = (campaignId: string) => {
    router.push(`/dashboard/generated-ads/${campaignId}`);
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
    <div className="border rounded-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
        <Skeleton className="h-4 w-full mt-4 mb-4" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="flex border-t border-border h-32">
        <div className="w-1/3">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="w-1/3 border-l border-border">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="w-1/3 border-l border-border">
          <Skeleton className="h-full w-full" />
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
        <h1 className="text-3xl font-bold">Campaign History</h1>
        <p className="text-muted-foreground">
          Browse and manage your past ad campaigns
        </p>
      </div>

      {campaigns.length === 0 && !isLoading && !hasActiveFilters ? (
        <div className="p-12 text-center bg-muted/30 rounded-lg border border-border">
          <h3 className="text-xl font-medium text-muted-foreground">
            No campaigns yet
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Start creating ad campaigns to see your history here
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
                placeholder="Search campaigns..."
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
              {[1, 2, 3].map((i) => (
                <CampaignSkeleton key={i} />
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="p-12 text-center bg-muted/30 rounded-lg border border-border">
              <h3 className="text-xl font-medium text-muted-foreground">
                No matching campaigns
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
                {campaigns.map((campaign: any) => (
                  <div
                    key={campaign.id}
                    className="overflow-hidden hover:shadow-md transition-all duration-300"
                  >
                    <div className="border rounded-md hover:shadow-md transition-all duration-300">
                      <div className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-semibold">
                              {campaign.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {getTimeAgo(new Date(campaign.createdAt))}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex cursor-pointer items-center gap-1 text-primary hover:text-primary/80"
                            onClick={() => handleViewCampaign(campaign.id)}
                          >
                            Visit <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>

                        {campaign.description && (
                          <p className="text-sm text-muted-foreground mb-4">
                            {campaign.description}
                          </p>
                        )}

                        {campaign.product && (
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                              {campaign.product.name}
                            </span>
                          </div>
                        )}
                      </div>

                      {campaign.ads && campaign.ads.length > 0 && (
                        <div className="flex border-t border-border">
                          {campaign.ads
                            .slice(0, 4)
                            .map((ad: any, index: number) => (
                              <div
                                key={ad.id || index}
                                className={`relative w-1/5 aspect-square ${
                                  index > 0 ? "border-l border-border" : ""
                                }`}
                              >
                                <Image
                                  src={ad.image || "/placeholder-image.jpg"}
                                  alt={ad.title || "Ad preview"}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ))}
                          {campaign.ads.length > 4 && (
                            <div className="w-1/5 aspect-square border-l border-border flex items-center justify-center bg-muted/30">
                              <p className="text-sm font-medium text-muted-foreground">
                                + {campaign.ads.length - 4} more
                              </p>
                            </div>
                          )}
                        </div>
                      )}
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
    </div>
  );
};

export default History;
