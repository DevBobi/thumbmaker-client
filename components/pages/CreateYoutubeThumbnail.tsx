"use client";

import React, { useState, useEffect } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Plus, Check, LayoutTemplate, Video, ChevronLeft, ChevronRight, Youtube, X, Eye, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Project } from "@/types";
import ThumbnailCreationSheet from "@/components/thumbnail/ThumbnailCreationSheet";
import Link from "next/link";
import Image from "next/image";


type SelectionMode = "none" | "template" | "youtube";

export default function CreateYoutubeThumbnail() {
  const { authFetch } = useAuthFetch();
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("none");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTemplates, setSelectedTemplates] = useState<any[]>([]);
  const [youtubeLinks, setYoutubeLinks] = useState<string[]>([""]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [templateType, setTemplateType] = useState<"preset" | "user">("preset");
  
  // Pagination state for templates - using server-side pagination
  const [templatePage, setTemplatePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const TEMPLATES_PER_PAGE = 12; // Match other components
  const MAX_SELECTIONS = 5; // Maximum templates user can select
  const MAX_YOUTUBE_LINKS = 5; // Maximum YouTube links


  // Fetch templates with server-side pagination and error handling
  const fetchTemplates = async (page: number = 1) => {
    try {
      setIsLoadingTemplates(true);
      
      // Use server-side pagination like other components
      const params = new URLSearchParams({
        page: page.toString(),
        limit: TEMPLATES_PER_PAGE.toString(),
      });
      
      // Add search parameter if provided
      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim());
      }
      
      // Use different endpoint based on template type
      const endpoint = templateType === "user" 
        ? `/api/templates/user?${params.toString()}`
        : `/api/templates/presets?${params.toString()}`;
      
      console.log('🔍 Fetching templates from:', endpoint);
      console.log('🔍 Search term:', searchTerm);
      console.log('🔍 Template type:', templateType);
      
      const response = await authFetch(endpoint);
      console.log('📊 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Response data:', data);
        
        // Handle different response structures
        const templatesArray = Array.isArray(data) ? data : (data.templates || []);
        const pagination = data.pagination || {
          total: templatesArray.length,
          page: page,
          limit: TEMPLATES_PER_PAGE,
          pages: Math.ceil(templatesArray.length / TEMPLATES_PER_PAGE),
        };
        
        console.log('📊 Templates found:', templatesArray.length);
        console.log('📊 Pagination:', pagination);
        
        setTemplates(templatesArray);
        setTotalPages(pagination.pages);
        setTemplatePage(pagination.page);
        
        // Edge case: If no templates found and we're searching, show message
        if (templatesArray.length === 0 && searchTerm.trim()) {
          console.log(`No templates found for search: "${searchTerm}"`);
        }
      } else {
        // Edge case: Handle API errors
        console.error("Failed to fetch templates:", response.status, response.statusText);
        const errorText = await response.text();
        console.error("Error response:", errorText);
        setTemplates([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      // Edge case: Set empty state on error
      setTemplates([]);
      setTotalPages(1);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  // Pagination handlers - simplified for server-side pagination
  const goToNextPage = () => {
    if (templatePage < totalPages) {
      fetchTemplates(templatePage + 1);
    }
  };

  const goToPrevPage = () => {
    if (templatePage > 1) {
      fetchTemplates(templatePage - 1);
    }
  };

  // Handle template selection
  const toggleTemplateSelection = (template: any) => {
    setSelectedTemplates(prev => {
      const isSelected = prev.some(t => t.id === template.id);
      if (isSelected) {
        return prev.filter(t => t.id !== template.id);
      } else {
        if (prev.length >= MAX_SELECTIONS) {
          alert(`You can select up to ${MAX_SELECTIONS} templates`);
          return prev;
        }
        return [...prev, template];
      }
    });
  };

  // YouTube links handlers with edge case management
  const addYoutubeLink = () => {
    if (youtubeLinks.length >= MAX_YOUTUBE_LINKS) {
      alert(`You can only add up to ${MAX_YOUTUBE_LINKS} YouTube links`);
      return;
    }
    setYoutubeLinks([...youtubeLinks, ""]);
  };

  const removeYoutubeLink = (index: number) => {
    if (youtubeLinks.length <= 1) {
      alert("You must have at least one YouTube link input");
      return;
    }
    setYoutubeLinks(youtubeLinks.filter((_, i) => i !== index));
  };

  const updateYoutubeLink = (index: number, value: string) => {
    // Edge case: Validate YouTube URL format
    if (value.trim() && !isValidYouTubeUrl(value)) {
      // Don't prevent typing, but could show warning
      console.warn("Invalid YouTube URL format");
    }
    const newLinks = [...youtubeLinks];
    newLinks[index] = value;
    setYoutubeLinks(newLinks);
  };

  // YouTube URL validation helper
  const isValidYouTubeUrl = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/;
    return youtubeRegex.test(url);
  };

  // Check if we have valid YouTube links with proper validation
  const hasValidYoutubeLinks = () => {
    return youtubeLinks.some(link => 
      link.trim().length > 0 && isValidYouTubeUrl(link.trim())
    );
  };

  // Get valid YouTube links for submission
  const getValidYoutubeLinks = () => {
    return youtubeLinks.filter(link => 
      link.trim().length > 0 && isValidYouTubeUrl(link.trim())
    );
  };

  // Handle mode selection
  const handleModeSelection = (mode: SelectionMode) => {
    setSelectionMode(mode);
    if (mode === "template") {
      fetchTemplates(1);
    }
  };

  // Handle search with debouncing
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setTemplatePage(1); // Reset to first page when searching
  };

  // Debounced search effect
  useEffect(() => {
    if (selectionMode === "template") {
      const timeoutId = setTimeout(() => {
        fetchTemplates(1);
      }, 300); // 300ms debounce
      
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, selectionMode, templateType]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProjects = async () => {
    try {
      const response = await authFetch("/api/projects");
      if (response.ok) {
      const data = await response.json();
        // Edge case: Handle different response structures
        const projectsArray = Array.isArray(data) ? data : (data.projects || []);
        setProjects(projectsArray);
        
        // Edge case: If no projects, show helpful message
        if (projectsArray.length === 0) {
          console.log("No projects found. User should create a project first.");
        }
      } else {
        // Edge case: Handle API errors
        console.error("Failed to fetch projects:", response.status, response.statusText);
        setProjects([]);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      // Edge case: Set empty state on error
      setProjects([]);
    }
  };

  // Load projects on mount
  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Create Thumbnail</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6 mb-8 gap-2">
        <h1 className="text-3xl font-bold">Create YouTube Thumbnail</h1>
        <p className="text-lg text-muted-foreground">
          Configure your thumbnail settings and choose a generation method
        </p>
      </div>

      <div className="space-y-6">
        {selectionMode === "none" ? (
          /* Initial Selection Cards */
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Choose Generation Method</h2>
              <p className="text-sm text-muted-foreground">
                Select how you want to create your thumbnails
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Template Selection Card */}
              <Card 
                className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-primary"
                onClick={() => handleModeSelection("template")}
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <LayoutTemplate className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Use Templates</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose from our pre-designed templates to create professional thumbnails quickly
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Check className="h-3 w-3" />
                    <span>Select up to {MAX_SELECTIONS} templates</span>
                  </div>
                </CardContent>
              </Card>

              {/* YouTube Link Card */}
              <Card 
                className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-primary"
                onClick={() => handleModeSelection("youtube")}
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center">
                    <Youtube className="h-8 w-8 text-red-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Use YouTube Links</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate thumbnails inspired by existing YouTube videos
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Check className="h-3 w-3" />
                    <span>Add up to {MAX_YOUTUBE_LINKS} video links</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Main Content After Selection */
          <>
        {/* Header Section */}
        <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectionMode("none");
                    setSelectedTemplates([]);
                    setYoutubeLinks([""]);
                    setSelectedProject(null);
                  }}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
          <div>
                  <h2 className="text-xl font-semibold">
                    {selectionMode === "template" ? "Select Templates & Project" : "Add YouTube Links & Project"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {selectionMode === "template" ? (
                      <>
                        Choose up to {MAX_SELECTIONS} templates and a project
                        {selectedTemplates.length > 0 && (
                          <span className="ml-2 text-primary font-medium">
                            ({selectedTemplates.length} selected)
                          </span>
                        )}
                      </>
                    ) : (
                      <>Add YouTube video links and select a project to continue</>
                    )}
                  </p>
                </div>
          </div>
          <div className="flex items-center gap-2">
                {((selectionMode === "template" && selectedTemplates.length > 0) || 
                  (selectionMode === "youtube" && hasValidYoutubeLinks())) && 
                  selectedProject && (
              <Button 
                onClick={() => setIsSheetOpen(true)}
                size="lg"
                className="px-8"
              >
                <Check className="h-4 w-4 mr-2" />
                Create Thumbnails
              </Button>
            )}
          </div>
                </div>
          </>
        )}

        {/* Main Selection Grid - Only show after mode selection */}
        {selectionMode !== "none" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Side - Templates or YouTube Links */}
            {selectionMode === "template" ? (
              /* Template Selection */
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
            <h3 className="font-medium flex items-center gap-2">
              <LayoutTemplate className="h-4 w-4" />
                    Choose Templates
            </h3>
                  
                  {/* Search Input */}
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search templates..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-8 h-8 text-sm"
                    />
                  </div>
                </div>
                
                {/* Template Type Selector */}
                <div className="flex items-center gap-2">
                  <Button
                    variant={templateType === "preset" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTemplateType("preset")}
                    className="h-8"
                  >
                    Preset Templates
                  </Button>
                  <Button
                    variant={templateType === "user" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTemplateType("user")}
                    className="h-8"
                  >
                    Your Templates
                  </Button>
                </div>
            
            {/* Templates Grid - Fixed height with scroll */}
            <ScrollArea className="h-[500px]">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-1 pr-4">
                {isLoadingTemplates ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
                    <p className="text-sm text-muted-foreground">Loading {templateType} templates...</p>
                  </div>
                ) : (templates || []).length > 0 ? (
                  (templates || []).map((template) => {
                    const isSelected = selectedTemplates.some(t => t.id === template.id);
                    const selectionIndex = selectedTemplates.findIndex(t => t.id === template.id);
                    
                    return (
                    <Card 
                      key={template.id} 
                        className={`cursor-pointer transition-all hover:shadow-md relative group ${
                          isSelected
                          ? 'ring-2 ring-primary bg-primary/5' 
                          : 'hover:bg-accent/50'
                      }`}
                        onClick={() => toggleTemplateSelection(template)}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 z-10 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md">
                            {selectionIndex + 1}
                          </div>
                        )}
                        
                        {/* Preview Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewTemplate(template);
                          }}
                          className="absolute top-2 left-2 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Eye className="h-3 w-3" />
                        </button>
                        
                        <CardContent className="p-2">
                          <div className="aspect-video bg-muted rounded-md mb-1 overflow-hidden relative group">
                          {template.image ? (
                              <Image 
                              src={template.image} 
                              alt={template.title}
                                fill
                                className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <LayoutTemplate className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                          <p className="text-xs font-medium truncate leading-tight">{template.title}</p>
                      </CardContent>
                    </Card>
                    );
                  })
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-8 text-center">
                    <LayoutTemplate className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No {templateType} templates found
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {templateType === "user" 
                        ? "You haven't created any custom templates yet" 
                        : "No preset templates available at the moment"
                      }
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>

                {/* Pagination Controls - Fixed at bottom */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between flex-shrink-0">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={goToPrevPage}
                      disabled={templatePage === 1 || isLoadingTemplates}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {templatePage} of {totalPages}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={goToNextPage}
                      disabled={templatePage === totalPages || isLoadingTemplates}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
                  </div>
                )}
              </div>
            ) : (
              /* YouTube Links Input */
              <div className="flex flex-col space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <Youtube className="h-4 w-4" />
                  YouTube Video Links
                </h3>
                
                {/* YouTube Links Container - Fixed height with scroll */}
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3 p-1 pr-4">
                    {youtubeLinks.map((link, index) => (
                      <div key={index} className="relative">
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium text-muted-foreground">
                                Link {index + 1}
                              </span>
                            </div>
                            <Input
                              placeholder="https://youtube.com/watch?v=..."
                              value={link}
                              onChange={(e) => updateYoutubeLink(index, e.target.value)}
                              className="w-full"
                            />
                          </div>
                          {youtubeLinks.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeYoutubeLink(index)}
                              className="mt-7 flex-shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
          </div>
                        
                        {/* Preview thumbnail if valid YouTube URL */}
                        {link && link.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/) && (
                          <div className="mt-2 relative aspect-video rounded-lg overflow-hidden border max-w-xs h-40">
                            <Image
                              src={`https://img.youtube.com/vi/${link.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1]}/maxresdefault.jpg`}
                              alt="YouTube thumbnail preview"
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Add Link Button - Fixed at bottom */}
                {youtubeLinks.length < MAX_YOUTUBE_LINKS && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={addYoutubeLink}
                    className="flex-shrink-0"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Link ({youtubeLinks.length}/{MAX_YOUTUBE_LINKS})
                  </Button>
                )}
              </div>
            )}

          {/* Project Selection */}
          <div className="flex flex-col space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <Video className="h-4 w-4" />
              Choose Project
            </h3>
            
            {/* Projects List - Fixed height with scroll */}
            <ScrollArea className="h-[500px]">
              <div className="space-y-2 pl-1 pr-4 py-2">
                {projects.length > 0 ? (
                  projects.map((project) => (
                  <Card 
                    key={project.id} 
                      className={`cursor-pointer transition-all hover:shadow-lg group ${
                      selectedProject?.id === project.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-accent/50'
                    }`}
                    onClick={() => setSelectedProject(project)}
                  >
                      <CardContent className="px-4 py-2">
                      <div className="flex items-center gap-3">
                          {/* Project Image/Thumbnail */}
                          <div className="relative w-12 h-8 flex-shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
                            {project.image ? (
                              <Image 
                                src={project.image} 
                                alt={project.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Video className="h-2.5 w-2.5 text-blue-600 dark:text-blue-400 opacity-50" />
                              </div>
                            )}
                            {/* Selected Overlay */}
                            {selectedProject?.id === project.id && (
                              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                <div className="bg-primary rounded-full p-0.5">
                                  <Check className="h-1.5 w-1.5 text-primary-foreground" />
                                </div>
                              </div>
                            )}
                        </div>
                          
                          {/* Project Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-medium text-sm line-clamp-1">
                                {project.title}
                              </h4>
                              {selectedProject?.id === project.id && (
                                <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {project.description.length > 50 
                                ? `${project.description.substring(0, 50)}...` 
                                : project.description
                              }
                            </p>
                            {project.targetAudience && (
                              <div className="mt-0.5">
                                <span className="text-xs px-1.5 py-0.5 bg-muted rounded-full">
                                  {project.targetAudience.length > 18 
                                    ? `${project.targetAudience.substring(0, 18)}...` 
                                    : project.targetAudience
                                  }
                                </span>
                      </div>
                        )}
                          </div>
                      </div>
                    </CardContent>
                  </Card>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Video className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                    <h3 className="font-medium text-lg mb-1">No projects yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create your first video project to get started
                    </p>
                    <Button variant="default" size="sm" asChild>
                      <Link href="/dashboard/create-video-project">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Project
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            {/* New Project Button - Fixed at bottom */}
            {projects.length > 0 && (
            <Button variant="outline" size="sm" asChild className="flex-shrink-0">
              <Link href="/dashboard/create-video-project">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Link>
            </Button>
            )}
          </div>
        </div>
        )}

      </div>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Template Preview</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPreviewTemplate(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-4">
                <Image
                  src={previewTemplate.image}
                  alt={previewTemplate.title}
                  width={800}
                  height={450}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-lg">{previewTemplate.title}</h4>
                {previewTemplate.description && (
                  <p className="text-muted-foreground">{previewTemplate.description}</p>
                )}
                {previewTemplate.tags && previewTemplate.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {previewTemplate.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-muted rounded-md text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-4 border-t">
              <Button
                variant="outline"
                onClick={() => setPreviewTemplate(null)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  toggleTemplateSelection(previewTemplate);
                  setPreviewTemplate(null);
                }}
              >
                {selectedTemplates.some(t => t.id === previewTemplate.id) ? 'Deselect' : 'Select'} Template
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Thumbnail Creation Sheet */}
      {((selectionMode === "template" && selectedTemplates.length > 0) || 
        (selectionMode === "youtube" && hasValidYoutubeLinks())) && 
        selectedProject && (
        <ThumbnailCreationSheet
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          selectedTemplates={selectionMode === "template" ? selectedTemplates : []}
          selectedProject={selectedProject}
          onProjectChange={setSelectedProject}
          availableProjects={projects}
          youtubeLinks={selectionMode === "youtube" ? getValidYoutubeLinks() : []}
          maxSelections={MAX_SELECTIONS}
        />
      )}
    </div>
  );
}
