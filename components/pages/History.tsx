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
  Pencil,
  Loader2,
  Sparkles,
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
import ThumbnailCreationSheet from "@/components/thumbnail/ThumbnailCreationSheet";
import { Project } from "@/types";

const ITEMS_PER_PAGE = 50; // Fetch more thumbnails to group properly
const PROJECTS_PER_PAGE = 5; // Show 5 projects per page
const RECENT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

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
  const [selectedThumbnail, setSelectedThumbnail] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'project'>('list'); // 'list' shows grouped projects, 'project' shows thumbnails in selected project
  const [historyTab, setHistoryTab] = useState<'projects' | 'timeline'>('timeline');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editingThumbnail, setEditingThumbnail] = useState<any | null>(null);
  const [editingSetDetails, setEditingSetDetails] = useState<any | null>(null);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [activeEditThumbnailId, setActiveEditThumbnailId] = useState<string | null>(null);
  const [clientNow, setClientNow] = useState<number | null>(null);
  const NewBadge = () => (
    <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 animate-pulse flex items-center gap-1">
      <Sparkles className="h-3 w-3" />
      New
    </Badge>
  );
  useEffect(() => {
    setClientNow(Date.now());
    const interval = setInterval(() => {
      setClientNow(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const isThumbnailNew = useCallback(
    (createdAt?: string | Date) => {
      if (!clientNow || !createdAt) return false;
      const createdTime = new Date(createdAt).getTime();
      if (Number.isNaN(createdTime)) return false;
      return clientNow - createdTime <= RECENT_WINDOW_MS;
    },
    [clientNow]
  );

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Reset state when component mounts/remounts
  useEffect(() => {
    setIsLoading(true);
    setCampaigns([]);
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const response = await authFetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        const projectsArray = Array.isArray(data) ? data : data.projects || [];
        setProjects(projectsArray);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error("Error fetching projects for edit flow:", error);
      setProjects([]);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

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
      params.append("page", "1"); // Always fetch from page 1
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
        setCampaigns(data.data || []);
      } else {
        console.error("Failed to fetch thumbnails");
      }
    } catch (error) {
      console.error("Error fetching thumbnails:", error);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, filterBy]);

  // Fetch campaigns when page, search term or filter changes
  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Reset to page 1 when campaigns data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterBy]);

  const closeEditSheet = useCallback(() => {
    setIsEditSheetOpen(false);
    setEditingThumbnail(null);
    setEditingSetDetails(null);
  }, []);

  const handleEditThumbnail = useCallback(async (thumbnail: any) => {
    if (!thumbnail?.setId) {
      toast({
        title: "Original settings unavailable",
        description: "We couldn't find the original generation data for this thumbnail.",
        variant: "destructive",
      });
      return;
    }

    setActiveEditThumbnailId(thumbnail.id);
    setIsLoadingEdit(true);
    try {
      const response = await authFetch(`/api/thumbnails/${thumbnail.setId}`);
      if (!response.ok) {
        throw new Error("Failed to load original settings");
      }
      const data = await response.json();
      setEditingSetDetails(data);
      setEditingThumbnail(thumbnail);
      setIsEditSheetOpen(true);
    } catch (error) {
      console.error("Failed to load edit data:", error);
      toast({
        title: "Unable to load",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingEdit(false);
      setActiveEditThumbnailId(null);
    }
  }, [authFetch, toast]);

  // Helpers
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    return `${diffInDays} days ago`;
  };

  const getDayLabel = useCallback((date: Date): string => {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfDate = new Date(date);
    startOfDate.setHours(0, 0, 0, 0);

    const diffInDays = Math.round(
      (startOfToday.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) {
      return date.toLocaleDateString(undefined, { weekday: "long" });
    }

    return date.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  const formatFullDate = (date: Date): string =>
    date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const formatTimeLabel = (date: Date): string =>
    date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });

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

  const timelineGroups = useMemo(() => {
    const dayMap = new Map<
      string,
      {
        key: string;
        date: Date;
        label: string;
        thumbnails: any[];
      }
    >();

    campaigns.forEach((thumbnail: any) => {
      if (!thumbnail?.createdAt) return;
      const createdDate = new Date(thumbnail.createdAt);
      const normalizedDate = new Date(createdDate);
      normalizedDate.setHours(0, 0, 0, 0);
      const dayKey = createdDate.toDateString();

      if (!dayMap.has(dayKey)) {
        dayMap.set(dayKey, {
          key: dayKey,
          date: normalizedDate,
          label: getDayLabel(createdDate),
          thumbnails: [],
        });
      }

      const dayGroup = dayMap.get(dayKey);
      dayGroup?.thumbnails.push(thumbnail);
    });

    const sortedGroups = Array.from(dayMap.values()).sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );

    sortedGroups.forEach((group) => {
      group.thumbnails.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

    return sortedGroups;
  }, [campaigns, getDayLabel]);

  // Client-side pagination for projects
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * PROJECTS_PER_PAGE;
    const endIndex = startIndex + PROJECTS_PER_PAGE;
    return groupedProjects.slice(startIndex, endIndex);
  }, [groupedProjects, currentPage]);

  // Calculate total pages for projects
  const totalProjectPages = Math.ceil(groupedProjects.length / PROJECTS_PER_PAGE);

  // Keep current page within bounds when data shrinks after updates like deletes
  useEffect(() => {
    setCurrentPage((prevPage) => {
      const totalPages = Math.ceil(groupedProjects.length / PROJECTS_PER_PAGE);
      const nextPage = totalPages === 0 ? 1 : Math.min(prevPage, totalPages);
      return nextPage === prevPage ? prevPage : nextPage;
    });
  }, [groupedProjects]);

  const editingProject = useMemo(() => {
    if (editingSetDetails?.project) return editingSetDetails.project;
    if (editingSetDetails?.projectId) {
      const found = projects.find((project) => project.id === editingSetDetails.projectId);
      if (found) return found;
    }
    return editingThumbnail?.project || null;
  }, [editingSetDetails, projects, editingThumbnail]);

  const availableProjectsForEdit = useMemo(() => {
    if (projects.length > 0) {
      return projects;
    }
    if (editingSetDetails?.project) {
      return [editingSetDetails.project];
    }
    if (editingThumbnail?.project) {
      return [editingThumbnail.project];
    }
    return [];
  }, [projects, editingSetDetails, editingThumbnail]);

  const editInitialMode = editingSetDetails?.templates?.length ? "template" : "youtube";
  const editYoutubeLinks = editingSetDetails?.youtubeLinks || [];
  const editLockedTemplateIds = useMemo(() => {
    if (editingThumbnail?.templateId) return [editingThumbnail.templateId];
    if (editingSetDetails?.templates) {
      return editingSetDetails.templates.map((template: any) => template.id);
    }
    return [];
  }, [editingThumbnail?.templateId, editingSetDetails?.templates]);

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
        const deletedId = thumbnailToDelete.id;

        toast({
          title: "Thumbnail deleted",
          description: "The thumbnail has been successfully deleted",
        });

        // Optimistically remove the deleted thumbnail so UI updates immediately
        setCampaigns((prev) =>
          prev.filter((thumbnail: any) => thumbnail.id !== deletedId)
        );

        setSelectedProject((prevSelected: any) => {
          if (!prevSelected) return prevSelected;
          return {
            ...prevSelected,
            thumbnails: prevSelected.thumbnails.filter(
              (thumb: any) => thumb.id !== deletedId
            ),
          };
        });
        
        // Close the detail sheet if this thumbnail was open
        if (selectedThumbnail?.id === deletedId) {
          setSelectedThumbnail(null);
        }
        
        // If deleting from project view, check if project becomes empty
        if (selectedProject && viewMode === 'project') {
          const updatedThumbnails = selectedProject.thumbnails.filter(
            (t: any) => t.id !== deletedId
          );
          
          if (updatedThumbnails.length === 0) {
            // Go back to list view if no more thumbnails
            handleBackToList();
          }
        }
        
        // Refetch to ensure local state matches server
        await fetchCampaigns();
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

  const handleEditSuccess = useCallback((data?: { id?: string }) => {
    toast({
      title: "Regeneration in progress",
      description: "We’re creating a new thumbnail with your updated instructions.",
    });
    closeEditSheet();
    fetchCampaigns();
    if (data?.id) {
      router.push(`/dashboard/generated-thumbnails/${data.id}`);
    }
  }, [toast, closeEditSheet, fetchCampaigns, router]);

  // Handle search with debounce
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
  };

  // Handle filter change
  const handleFilterChange = (value: string) => {
    setFilterBy(value);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setFilterBy("All");
  };

  // Skeleton loader for project cards
  const ProjectSkeleton = () => (
    <div className="bg-card border rounded-xl shadow-sm overflow-hidden p-6">
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

  const TimelineSkeleton = () => (
    <div className="space-y-6">
      {[1, 2].map((group) => (
        <div key={group} className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((item) => (
              <div key={item} className="border rounded-xl p-4 space-y-3">
                <Skeleton className="h-4 w-28" />
                <div className="flex gap-3">
                  <Skeleton className="w-32 aspect-video rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
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

          {/* View toggles */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <div className="inline-flex items-center rounded-full border bg-muted/40 p-1">
              <Button
                variant={historyTab === 'projects' ? "default" : "ghost"}
                size="sm"
                className={`rounded-full ${historyTab === 'projects' ? 'shadow-sm' : ''}`}
                onClick={() => setHistoryTab('projects')}
              >
                Projects
              </Button>
              <Button
                variant={historyTab === 'timeline' ? "default" : "ghost"}
                size="sm"
                className={`rounded-full ${historyTab === 'timeline' ? 'shadow-sm' : ''}`}
                onClick={() => setHistoryTab('timeline')}
              >
                Timeline
              </Button>
            </div>
          </div>

          {historyTab === 'projects' ? (
            isLoading ? (
              <div className="space-y-4 mt-6">
                {[1, 2].map((i) => (
                  <ProjectSkeleton key={i} />
                ))}
              </div>
            ) : groupedProjects.length === 0 ? (
              <Card className="border-dashed border-2 mt-6">
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
                <div className="space-y-4 mt-6">
                  {paginatedProjects.map((project: any) => {
                    const hasRecent =
                      Array.isArray(project.thumbnails) &&
                      project.thumbnails.some((thumbnail: any) =>
                        isThumbnailNew(thumbnail.createdAt)
                      );
                    return (
                    <div
                      key={project.id}
                      className="bg-card border rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
                      onClick={() => handleViewProject(project)}
                    >
                      {hasRecent && (
                        <div className="absolute right-4 top-4">
                          <NewBadge />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-start gap-6">
                          {/* Thumbnail Preview - Left Side */}
                          <div className="flex-shrink-0">
                            <div className="relative w-48 h-28 rounded-lg overflow-hidden border-2 border-border group-hover:border-primary/50 transition-all">
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
                    );
                  })}
                </div>

                {/* Pagination controls */}
                {totalProjectPages > 1 && (
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
                        { length: totalProjectPages },
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
                              Math.min(totalProjectPages, currentPage + 1)
                            )
                          }
                          className={
                            currentPage === totalProjectPages
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )
          ) : (
            <div className="mt-6">
              {isLoading ? (
                <TimelineSkeleton />
              ) : timelineGroups.length === 0 ? (
                <Card className="border-dashed border-2">
                  <CardContent className="p-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="bg-muted rounded-full p-3">
                        <Calendar className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium text-lg">No timeline entries</h3>
                      <p className="text-muted-foreground max-w-md">
                        Try adjusting your search or filter criteria to see older batches
                      </p>
                      <Button variant="outline" className="mt-2" onClick={resetFilters}>
                        Clear all filters
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-10">
                  {timelineGroups.map((group) => (
                    <div key={group.key} className="relative pl-6 sm:pl-10">
                      <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
                      <div className="absolute left-2 top-2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-primary bg-background" />

                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <div className="flex items-center gap-2 text-foreground font-semibold text-lg">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>{group.label}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatFullDate(group.date)}
                        </span>
                        <Badge variant="secondary" className="capitalize">
                          {group.thumbnails.length} thumbnail{group.thumbnails.length !== 1 ? 's' : ''} generated
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {group.thumbnails.map((thumbnail: any) => {
                          const thumbnailIsNew = isThumbnailNew(thumbnail.createdAt);
                          return (
                          <div
                            key={thumbnail.id}
                            className="border rounded-xl p-4 bg-card/60 hover:bg-card transition-all cursor-pointer group/timeline-card"
                            onClick={() => handleViewThumbnail(thumbnail)}
                          >
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span suppressHydrationWarning>{formatTimeLabel(new Date(thumbnail.createdAt))}</span>
                              <Badge
                                variant={thumbnail.status === "COMPLETED" ? "default" : "secondary"}
                                className={thumbnail.status === "COMPLETED" ? "bg-green-500/20 text-green-700 border border-green-200" : ""}
                              >
                                {thumbnail.status === "COMPLETED" ? "Completed" : "In progress"}
                              </Badge>
                              {thumbnailIsNew && <NewBadge />}
                            </div>

                            <div className="mt-3 flex gap-3">
                              <div className="relative w-32 aspect-video rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                {thumbnail.image ? (
                                  <Image
                                    src={thumbnail.image}
                                    alt={thumbnail.title || "Thumbnail preview"}
                                    fill
                                    sizes="128px"
                                    className="object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm text-foreground line-clamp-2">
                                  {thumbnail.title || `Thumbnail ${thumbnail.id.slice(-8).toUpperCase()}`}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {thumbnail.project?.title
                                    ? `Project: ${thumbnail.project.title}`
                                    : "Ungrouped thumbnail"}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-2">
                                  <span className="font-mono">#{thumbnail.id.slice(-6).toUpperCase()}</span>
                                  {thumbnail.templateId && (
                                    <Badge variant="outline" className="text-[10px]">
                                      Template #{thumbnail.templateId.toString().padStart(2, '0')}
                                    </Badge>
                                  )}
                                </div>

                                <div className="flex flex-wrap gap-2 mt-3">
                                  {thumbnailIsNew && <NewBadge />}
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="h-8"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditThumbnail(thumbnail);
                                    }}
                                    disabled={
                                      isLoadingEdit && activeEditThumbnailId === thumbnail.id
                                    }
                                  >
                                    {isLoadingEdit && activeEditThumbnailId === thumbnail.id ? (
                                      <>
                                        <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                                        Loading...
                                      </>
                                    ) : (
                                      <>
                                        <Pencil className="h-3.5 w-3.5 mr-1" />
                                        Edit / Reprompt
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownload(
                                        thumbnail.image,
                                        thumbnail.title || `thumbnail-${thumbnail.id.slice(-8)}`,
                                        thumbnail.id
                                      );
                                    }}
                                    disabled={!thumbnail.image || isDownloading === thumbnail.id}
                                  >
                                    <Download className="h-3.5 w-3.5 mr-1" />
                                    Download
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteClick(thumbnail);
                                    }}
                                    disabled={isDeleting === thumbnail.id}
                                  >
                                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                                    Delete
                                  </Button>
                                  {thumbnail.projectId && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/dashboard/projects?edit=${thumbnail.projectId}`);
                                      }}
                                    >
                                      <Video className="h-3.5 w-3.5 mr-1" />
                                      Open Project
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        /* Project View - Shows all thumbnails in selected project */
        <div className="space-y-6">
          {selectedProject && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {selectedProject.thumbnails.map((thumbnail: any) => (
                <div 
                  key={thumbnail.id}
                  className="group cursor-pointer"
                >
                  {/* YouTube-style Thumbnail Card */}
                  <div className="space-y-3">
                    {/* Thumbnail Image Container */}
                    <div 
                      className="relative w-full aspect-video overflow-hidden rounded-xl bg-muted"
                      onClick={() => handleViewThumbnail(thumbnail)}
                    >
                      {thumbnail.image ? (
                        <>
                          <Image
                            src={thumbnail.image}
                            alt={thumbnail.title || "Thumbnail preview"}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                            className="object-cover transition-all duration-200"
                            unoptimized
                          />
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                      )}
                      
                      {/* Action Buttons Overlay - Top Right */}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {/* Download Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(thumbnail.image, thumbnail.title || `thumbnail-${thumbnail.id.slice(-8)}`, thumbnail.id);
                          }}
                          disabled={!thumbnail.image || isDownloading === thumbnail.id}
                          className="bg-black/80 hover:bg-black backdrop-blur-sm p-2 rounded-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Download"
                        >
                          <Download className="h-4 w-4 text-white" />
                        </button>
                        
                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(thumbnail);
                          }}
                          disabled={isDeleting === thumbnail.id}
                          className="bg-black/80 hover:bg-black backdrop-blur-sm p-2 rounded-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-white" />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditThumbnail(thumbnail);
                          }}
                          disabled={isLoadingEdit && activeEditThumbnailId === thumbnail.id}
                          className="bg-black/80 hover:bg-black backdrop-blur-sm p-2 rounded-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Edit / Reprompt"
                        >
                          {isLoadingEdit && activeEditThumbnailId === thumbnail.id ? (
                            <Loader2 className="h-4 w-4 text-white animate-spin" />
                          ) : (
                            <Pencil className="h-4 w-4 text-white" />
                          )}
                        </button>
                      </div>
                      
                      {/* Duration badge (YouTube style) - Bottom Right */}
                      <div className="absolute bottom-2 right-2">
                        <div className="bg-black/90 text-white text-xs font-semibold px-1.5 py-0.5 rounded">
                          16:9
                        </div>
                      </div>
                    </div>
                    
                    {/* Thumbnail Info Section - YouTube style */}
                    <div className="flex gap-3">
                      {/* Status indicator circle */}
                      <div className="flex-shrink-0 pt-1">
                        <div className={`w-2 h-2 rounded-full ${
                          thumbnail.status === "COMPLETED" 
                            ? "bg-green-500" 
                            : "bg-yellow-500"
                        }`} />
                      </div>
                      
                      {/* Text content */}
                      <div className="flex-1 min-w-0">
                        {/* Title */}
                        <h3 
                          className="font-semibold text-sm line-clamp-2 text-foreground mb-1 leading-tight group-hover:text-primary transition-colors"
                          onClick={() => handleViewThumbnail(thumbnail)}
                        >
                          {thumbnail.title || `Thumbnail ${thumbnail.id.slice(-8).toUpperCase()}`}
                        </h3>

                        {/* Metadata - YouTube style */}
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                          <span suppressHydrationWarning>{getTimeAgo(new Date(thumbnail.createdAt))}</span>
                          <span>•</span>
                          <span className="font-mono">#{thumbnail.id.slice(-6).toUpperCase()}</span>
                          {isThumbnailNew(thumbnail.createdAt) && <NewBadge />}
                        </div>

                        {/* Template Badge */}
                        {thumbnail.templateId && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/dashboard/templates?template=${thumbnail.templateId}`);
                            }}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted hover:bg-muted/80 transition-colors text-xs group/template"
                          >
                            <Palette className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground font-medium">Template #{thumbnail.templateId.toString().padStart(2, '0')}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
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
            className="relative max-w-7xl w-full max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setSelectedThumbnail(null);
              }}
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
              <Image
                src={selectedThumbnail.image}
                alt={selectedThumbnail.title || "Thumbnail preview"}
                width={1280}
                height={720}
                className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
                unoptimized
                priority
              />
            </div>

            {/* Info Footer */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
              <div className="flex items-end justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-xl mb-2 truncate">
                    {selectedThumbnail.title || `Thumbnail ${selectedThumbnail.id.slice(-8).toUpperCase()}`}
                  </h3>
                </div>
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

      {editingSetDetails && editingProject && (
        <ThumbnailCreationSheet
          isOpen={isEditSheetOpen}
          onClose={closeEditSheet}
          selectedTemplates={editingSetDetails.templates || []}
          selectedProject={editingProject}
          availableProjects={availableProjectsForEdit}
          youtubeLinks={editYoutubeLinks}
          initialMode={editInitialMode}
          initialInspirationUrl={editingSetDetails.inspirationUrl || ""}
          mode="edit"
          existingAssetUrls={editingSetDetails.assets || []}
          initialChannelStyle={editingSetDetails.channelStyle || ""}
          initialThumbnailGoal={editingSetDetails.thumbnailGoal || ""}
          initialVariations={editingSetDetails.variations || 1}
          initialInstructions={editingSetDetails.additionalInstructions || ""}
          lockedTemplateIds={editLockedTemplateIds}
          showCreditReminder
          creditReminderMessage="Each edit or regeneration deducts credits from your balance."
          onGenerateComplete={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default History;
