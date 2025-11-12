"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ChevronDown,
  Search,
  X,
  Calendar,
  Download,
  Video,
  Palette,
  ExternalLink,
  Plus,
  Image as ImageIcon,
  Trash2,
  FolderOpen,
  ChevronRight,
  ArrowLeft,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
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
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Breadcrumb from "@/components/Breadcrumb";
import Link from "next/link";

const ITEMS_PER_PAGE = 6;

const History = () => {
  const router = useRouter();
  const { authFetch } = useAuthFetch();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [thumbnailToDelete, setThumbnailToDelete] = useState<any>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 6,
    totalPages: 0,
  });
  const [selectedThumbnail, setSelectedThumbnail] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'project'>('list'); // 'list' shows grouped projects, 'project' shows thumbnails in selected project

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Reset state when component mounts/remounts
  useEffect(() => {
    setIsLoading(true);
    setCampaigns([]);
  }, []);

  // Handle escape key to close lightbox and prevent body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedThumbnail) {
        setSelectedThumbnail(null);
      }
    };
    
    if (selectedThumbnail) {
      window.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [selectedThumbnail]);

  // Fetch campaigns function
  const fetchCampaigns = useCallback(async () => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearchTerm, filterBy]);

  // Fetch campaigns when page, search term or filter changes
  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Group thumbnails by project
  const groupedProjects = useMemo(() => {
    const projectMap = new Map();
    
    campaigns.forEach((thumbnail: any) => {
      const projectId = thumbnail.projectId || 'ungrouped';
      const projectTitle = thumbnail.project?.title || 'Ungrouped Thumbnails';
      
      if (!projectMap.has(projectId)) {
        projectMap.set(projectId, {
          id: projectId,
          title: projectTitle,
          thumbnails: [],
          latestDate: thumbnail.createdAt,
        });
      }
      
      const project = projectMap.get(projectId);
      project.thumbnails.push(thumbnail);
      
      // Update latest date if this thumbnail is newer
      if (new Date(thumbnail.createdAt) > new Date(project.latestDate)) {
        project.latestDate = thumbnail.createdAt;
      }
    });
    
    // Convert map to array and sort by latest date
    return Array.from(projectMap.values()).sort((a, b) => 
      new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime()
    );
  }, [campaigns]);

  const handleViewProject = (project: any) => {
    setSelectedProject(project);
    setViewMode('project');
  };

  const handleBackToList = () => {
    setSelectedProject(null);
    setViewMode('list');
  };

  const handleViewThumbnail = (thumbnail: any) => {
    setSelectedThumbnail(thumbnail);
  };

  // Function to handle thumbnail download
  const handleDownload = async (imageUrl: string, thumbnailTitle: string, thumbnailId?: string) => {
    if (!imageUrl) {
      toast({
        title: "Download failed",
        description: "Image URL is not available",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(thumbnailId || imageUrl);
    
    try {
      // Fetch the image as a blob to handle CORS issues
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error("Failed to fetch image");
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create and trigger download
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${thumbnailTitle.replace(/\s+/g, "-").toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      toast({
        title: "Download successful",
        description: "Thumbnail has been downloaded",
      });
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        title: "Download failed",
        description: "Opening image in new tab instead",
        variant: "destructive",
      });
      // Fallback: try opening in new tab
      window.open(imageUrl, "_blank");
    } finally {
      setIsDownloading(null);
    }
  };

  // Function to handle thumbnail delete
  const handleDeleteClick = (thumbnail: any) => {
    setThumbnailToDelete(thumbnail);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!thumbnailToDelete) return;

    setIsDeleting(thumbnailToDelete.id);
    
    try {
      const response = await authFetch(`/api/thumbnails/${thumbnailToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Thumbnail deleted",
          description: "The thumbnail has been successfully deleted",
        });
        
        // Close the detail sheet if this thumbnail was open
        if (selectedThumbnail?.id === thumbnailToDelete.id) {
          setSelectedThumbnail(null);
        }
        
        // If deleting from project view, check if project becomes empty
        if (selectedProject && viewMode === 'project') {
          const updatedThumbnails = selectedProject.thumbnails.filter(
            (t: any) => t.id !== thumbnailToDelete.id
          );
          
          if (updatedThumbnails.length === 0) {
            // Go back to list view if no more thumbnails
            handleBackToList();
          }
        }
        
        // If we're on a page with only 1 item and it's not the first page, go back
        if (campaigns.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          // Otherwise, refetch the current page
          await fetchCampaigns();
        }
      } else {
        const data = await response.json();
        toast({
          title: "Delete failed",
          description: data.message || "Failed to delete thumbnail",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Delete failed:", error);
      toast({
        title: "Delete failed",
        description: "An error occurred while deleting the thumbnail",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
      setDeleteConfirmOpen(false);
      setThumbnailToDelete(null);
    }
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

  // Skeleton loader for project cards
  const ProjectSkeleton = () => (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-6">
      <div className="flex items-start gap-6">
        {/* Thumbnail Skeleton */}
        <div className="flex-shrink-0">
          <Skeleton className="w-48 h-28 rounded-lg" />
        </div>
        
        {/* Content Skeleton */}
        <div className="flex-1 space-y-3">
          <div className="space-y-2">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full max-w-md" />
          </div>
        </div>

        {/* Action Button Skeleton */}
        <div>
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );

  // Check if any filters are active
  const hasActiveFilters = searchTerm !== "" || filterBy !== "All";

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={
          viewMode === 'list'
            ? [
                { label: "Dashboard", href: "/dashboard" },
                { label: "History", href: "/dashboard/history" },
              ]
            : [
                { label: "Dashboard", href: "/dashboard" },
                { label: "History", href: "/dashboard/history" },
                { label: selectedProject?.title || "Project", href: "#" },
              ]
        }
      />
      
      {/* Header with Back Button in Project View */}
      {viewMode === 'project' ? (
        <div className="flex items-start gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBackToList}
            className="flex-shrink-0 h-10 w-10 mt-1"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 mb-2">
              <FolderOpen className="h-8 w-8 text-primary flex-shrink-0 mt-0.5" />
              <h1 className="text-3xl font-bold text-foreground leading-tight">{selectedProject?.title}</h1>
            </div>
            <p className="text-sm text-muted-foreground pl-[2.75rem]">
              {selectedProject?.thumbnails.length} thumbnail{selectedProject?.thumbnails.length !== 1 ? 's' : ''} in this project
            </p>
          </div>
          {selectedProject?.id !== 'ungrouped' && (
            <Button
              variant="outline"
              className="gap-2 flex-shrink-0 mt-1"
              onClick={() => router.push(`/dashboard/projects?edit=${selectedProject.id}`)}
            >
              <Video className="h-4 w-4" />
              Open Project
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Thumbnail History</h1>
            <p className="text-muted-foreground mt-1">
              Browse and manage your generated thumbnails
            </p>
          </div>
        </div>
      )}

      {viewMode === 'list' && campaigns.length === 0 && !isLoading && !hasActiveFilters ? (
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
      ) : viewMode === 'list' ? (
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
                <ProjectSkeleton key={i} />
              ))}
            </div>
          ) : groupedProjects.length === 0 ? (
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
                {groupedProjects.map((project: any) => (
                  <div
                    key={project.id}
                    className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
                    onClick={() => handleViewProject(project)}
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-6">
                        {/* Thumbnail Preview - Left Side */}
                        <div className="flex-shrink-0">
                          <div className="relative w-48 h-28 rounded-lg overflow-hidden border-2 border-gray-200 group-hover:border-primary/50 transition-all">
                            {project.thumbnails[0]?.image ? (
                              <>
                                <Image
                                  src={project.thumbnails[0].image}
                                  alt={project.thumbnails[0].title || "Thumbnail preview"}
                                  fill
                                  sizes="192px"
                                  className="object-cover"
                                  unoptimized
                                />
                                {/* Multiple Thumbnails Badge */}
                                {project.thumbnails.length > 1 && (
                                  <div className="absolute bottom-2.5 right-2.5 bg-gradient-to-r from-blue-600 to-purple-600 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xl border-2 border-white/20">
                                    <ImageIcon className="h-4 w-4 text-white" />
                                    <span className="text-white font-bold text-base leading-none">
                                      +{project.thumbnails.length - 1}
                                    </span>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center">
                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Content - Middle */}
                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <FolderOpen className="h-5 w-5 text-primary flex-shrink-0" />
                                <h3 className="text-lg font-bold text-foreground line-clamp-1">
                                  {project.title}
                                </h3>
                              </div>
                              {project.id !== 'ungrouped' && (
                                <p className="text-xs text-muted-foreground font-mono">
                                  Project ID: {project.id.slice(-12).toUpperCase()}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Metadata */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1.5">
                              <ImageIcon className="h-4 w-4" />
                              <span className="font-medium">{project.thumbnails.length} Thumbnail{project.thumbnails.length !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4" />
                              <span suppressHydrationWarning>Last updated {getTimeAgo(new Date(project.latestDate))}</span>
                            </div>
                          </div>

                          {/* Status Summary */}
                          <div className="flex items-center gap-2">
                            {project.thumbnails.filter((t: any) => t.status === 'COMPLETED').length === project.thumbnails.length ? (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                All Complete
                              </Badge>
                            ) : (
                              <>
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  {project.thumbnails.filter((t: any) => t.status === 'COMPLETED').length} Complete
                                </Badge>
                                {project.thumbnails.filter((t: any) => t.status !== 'COMPLETED').length > 0 && (
                                  <Badge variant="secondary">
                                    {project.thumbnails.filter((t: any) => t.status !== 'COMPLETED').length} Pending
                                  </Badge>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Action Button - Right Side */}
                        <div className="flex items-center">
                          <Button
                            variant="outline"
                            className="gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                          >
                            View All
                            <ChevronRight className="h-4 w-4" />
                          </Button>
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
      ) : (
        /* Project View - Shows all thumbnails in selected project */
        <div className="space-y-6">
          {selectedProject && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedProject.thumbnails.map((thumbnail: any) => (
                <Card 
                  key={thumbnail.id}
                  className="group overflow-hidden border border-gray-200/60 hover:border-primary/40 transition-all duration-300 hover:shadow-xl bg-white rounded-2xl"
                >
                  <div className="relative">
                    {/* Thumbnail Image Container */}
                    <div 
                      className="relative w-full aspect-video overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer"
                      onClick={() => handleViewThumbnail(thumbnail)}
                    >
                      {thumbnail.image ? (
                        <>
                          <Image
                            src={thumbnail.image}
                            alt={thumbnail.title || "Thumbnail preview"}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            unoptimized
                          />
                          {/* Overlay on hover */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/95 backdrop-blur-sm rounded-full p-3 shadow-xl">
                              <Eye className="h-5 w-5 text-primary" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                      )}
                      
                      {/* Action Buttons Overlay - Top Right */}
                      <div className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {/* Download Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(thumbnail.image, thumbnail.title || `thumbnail-${thumbnail.id.slice(-8)}`, thumbnail.id);
                          }}
                          disabled={!thumbnail.image || isDownloading === thumbnail.id}
                          className="bg-white/95 hover:bg-white backdrop-blur-md p-2 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                          title="Download"
                        >
                          <Download className="h-3.5 w-3.5 text-blue-600 group-hover/btn:scale-110 transition-transform" />
                        </button>
                        
                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(thumbnail);
                          }}
                          disabled={isDeleting === thumbnail.id}
                          className="bg-white/95 hover:bg-white backdrop-blur-md p-2 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-600 group-hover/btn:scale-110 transition-transform" />
                        </button>
                      </div>
                      
                      {/* Status Badge Overlay - Top Left */}
                      <div className="absolute top-2.5 left-2.5">
                        <Badge 
                          variant={thumbnail.status === "COMPLETED" ? "default" : "secondary"}
                          className={`shadow-md text-[10px] px-2 py-0.5 ${
                            thumbnail.status === "COMPLETED" 
                              ? "bg-green-500/95 text-white border-0 font-semibold backdrop-blur-sm" 
                              : "bg-gray-500/95 text-white border-0 font-semibold backdrop-blur-sm"
                          }`}
                        >
                          {thumbnail.status === "COMPLETED" ? "✓" : "⏳"}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Thumbnail Info Section */}
                    <div className="p-4">
                      {/* Title */}
                      <h4 className="font-semibold text-[15px] line-clamp-2 text-foreground leading-tight mb-3 min-h-[2.6rem]">
                        {thumbnail.title || `Thumbnail ${thumbnail.id.slice(-8).toUpperCase()}`}
                      </h4>

                      {/* Metadata Cards */}
                      <div className="space-y-2">
                        {/* Date and ID Row */}
                        <div className="flex items-stretch gap-2">
                          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50/50 rounded-lg flex-1 min-h-[28px]">
                            <Calendar className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                            <span suppressHydrationWarning className="text-xs text-blue-900/80 font-medium truncate leading-none">{getTimeAgo(new Date(thumbnail.createdAt))}</span>
                          </div>
                          <div className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-gray-100/80 rounded-lg min-h-[28px]">
                            <span className="font-mono text-[11px] text-gray-700 font-semibold leading-none">#{thumbnail.id.slice(-6).toUpperCase()}</span>
                          </div>
                        </div>

                        {/* Template Badge */}
                        {thumbnail.templateId && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/dashboard/templates?template=${thumbnail.templateId}`);
                            }}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-200 border border-purple-100 hover:border-purple-200 w-full group/template min-h-[32px]"
                          >
                            <Palette className="h-3.5 w-3.5 text-purple-600 flex-shrink-0" />
                            <span className="text-xs font-semibold text-purple-700 flex-1 text-left leading-none">Template #{thumbnail.templateId.toString().padStart(2, '0')}</span>
                            <ExternalLink className="h-3 w-3 text-purple-600 opacity-0 group-hover/template:opacity-100 transition-opacity flex-shrink-0" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Thumbnail Lightbox View */}
      {selectedThumbnail && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedThumbnail(null)}
        >
          <div 
            className="relative max-w-7xl w-full max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedThumbnail(null)}
              className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-full transition-all hover:scale-110 group"
              title="Close (Esc)"
            >
              <X className="h-6 w-6 text-white" />
            </button>

            {/* Action Buttons */}
            <div className="absolute top-4 left-4 z-10 flex gap-3">
              <button
                onClick={() => handleDownload(selectedThumbnail.image, selectedThumbnail.title || `thumbnail-${selectedThumbnail.id.slice(-8)}`, selectedThumbnail.id)}
                disabled={!selectedThumbnail.image || isDownloading === selectedThumbnail.id}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-full transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed group"
                title="Download"
              >
                <Download className="h-5 w-5 text-white" />
              </button>
              <button
                onClick={() => handleDeleteClick(selectedThumbnail)}
                disabled={isDeleting === selectedThumbnail.id}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-full transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed group"
                title="Delete"
              >
                <Trash2 className="h-5 w-5 text-white" />
              </button>
            </div>

            {/* Thumbnail Image */}
            <div className="relative max-w-full max-h-full">
              <Zoom
                zoomImg={{
                  src: selectedThumbnail.image,
                  alt: selectedThumbnail.title || "Thumbnail preview",
                  width: 1920,
                  height: 1080,
                }}
                zoomMargin={40}
                classDialog="custom-zoom"
              >
                <Image
                  src={selectedThumbnail.image}
                  alt={selectedThumbnail.title || "Thumbnail preview"}
                  width={1280}
                  height={720}
                  className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
                  unoptimized
                  priority
                />
              </Zoom>
            </div>

            {/* Info Overlay - Bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
              <div className="flex items-end justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-xl mb-2 truncate">
                    {selectedThumbnail.title || `Thumbnail ${selectedThumbnail.id.slice(-8).toUpperCase()}`}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      <span suppressHydrationWarning>{getTimeAgo(new Date(selectedThumbnail.createdAt))}</span>
                    </div>
                    {selectedThumbnail.templateId && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/templates?template=${selectedThumbnail.templateId}`);
                          setSelectedThumbnail(null);
                        }}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all"
                      >
                        <Palette className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">Template #{selectedThumbnail.templateId.toString().padStart(2, '0')}</span>
                      </button>
                    )}
                    {selectedThumbnail.projectId && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/projects?edit=${selectedThumbnail.projectId}`);
                          setSelectedThumbnail(null);
                        }}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all"
                      >
                        <Video className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">Open Project</span>
                      </button>
                    )}
                  </div>
                </div>
                <Badge 
                  className={`shrink-0 ${
                    selectedThumbnail.status === "COMPLETED" 
                      ? "bg-green-500/90 text-white border-0" 
                      : "bg-gray-500/90 text-white border-0"
                  }`}
                >
                  {selectedThumbnail.status === "COMPLETED" ? "✓ Complete" : "⏳ Pending"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the thumbnail &quot;{thumbnailToDelete?.title || `Thumbnail ${thumbnailToDelete?.id.slice(-8).toUpperCase()}`}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting === thumbnailToDelete?.id}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting === thumbnailToDelete?.id}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting === thumbnailToDelete?.id ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default History;
