"use client";

import { useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import TemplateSelector from "@/components/thumbnail/TemplateSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Upload, Plus, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Search, Loader2 } from "lucide-react";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface Project {
  id: string;
  name: string;
  overview: string;
}

const channelStyles = [
  {
    value: "professional",
    label: "Professional & Educational",
    description: "Clean, informative, and authoritative style suitable for educational content",
  },
  {
    value: "entertainment",
    label: "Entertainment & Gaming",
    description: "Dynamic, energetic, and engaging style for entertainment content",
  },
  {
    value: "lifestyle",
    label: "Lifestyle & Vlog",
    description: "Personal, authentic, and relatable style for lifestyle content",
  },
  {
    value: "tech",
    label: "Tech & Reviews",
    description: "Modern, sleek, and technical style for technology content",
  },
];

const thumbnailGoals = [
  {
    value: "clickbait",
    label: "Clickbait & Curiosity",
    description: "Create intrigue and curiosity to drive clicks",
  },
  {
    value: "preview",
    label: "Content Preview",
    description: "Show a preview of the video content",
  },
  {
    value: "branding",
    label: "Brand Recognition",
    description: "Focus on brand identity and recognition",
  },
  {
    value: "emotion",
    label: "Emotional Response",
    description: "Evoke specific emotions from viewers",
  },
];

export default function CreateYoutubeThumbnail() {
  const { authFetch } = useAuthFetch();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [inspirationUrl, setInspirationUrl] = useState("");
  const [inspirationPreview, setInspirationPreview] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [channelStyle, setChannelStyle] = useState<string>("");
  const [thumbnailGoal, setThumbnailGoal] = useState<string>("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [videoVariations, setVideoVariations] = useState(1);
  const [templateVariations, setTemplateVariations] = useState(1);
  const [thumbnailAssets, setThumbnailAssets] = useState<File[]>([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const handleInspirationUrlChange = (url: string) => {
    setInspirationUrl(url);
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
    if (videoId) {
      setInspirationPreview(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
    } else {
      setInspirationPreview(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setThumbnailAssets(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setThumbnailAssets(prev => prev.filter((_, i) => i !== index));
  };

  // Search projects API query
  const {
    data: searchResults,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["projectSearch", debouncedSearchTerm],
    queryFn: async () => {
      if (!debouncedSearchTerm.trim()) {
        // Return recent projects when no search term is provided
        const response = await authFetch("/api/projects/recent?take=3");
        if (!response.ok) {
          throw new Error("Failed to fetch recent projects");
        }
        return response.json();
      }

      const response = await authFetch(
        `/api/projects/search?query=${encodeURIComponent(
          debouncedSearchTerm
        )}&take=3`
      );
      if (!response.ok) {
        throw new Error("Failed to search projects");
      }
      return response.json();
    },
    enabled: isOpen, // Only run query when dialog is open
  });

  const handleGenerate = async () => {
    // TODO: Handle thumbnail generation
    console.log({
      projectId: selectedProject?.id,
      templates: selectedTemplates,
      inspirationUrl,
      channelStyle,
      thumbnailGoal,
      additionalInstructions,
      videoVariations,
      templateVariations,
      thumbnailAssets,
    });
  };

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

      <div className="space-y-8">
        {/* Project Selection */}
        <Card>
          <CardHeader>
            <div className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>Select Project</CardTitle>
                <p className="text-sm mt-2 text-muted-foreground">
                  Configure your ad details before choosing a template
                </p>
              </div>
              <Button variant="brand" asChild>
                <Link href="/dashboard/create-video-project">
                  <Plus className="mr-2 h-4 w-4" />
                  Add a Video Project
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {selectedProject ? selectedProject.name : "Select a Project"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Select a Project</DialogTitle>
                </DialogHeader>

                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>

                <div className="mt-4 space-y-2">
                  {isLoading ? (
                    <div className="flex justify-center items-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="ml-2">Searching projects...</span>
                    </div>
                  ) : error ? (
                    <div className="text-center p-4 text-destructive">
                      Error loading projects. Please try again.
                    </div>
                  ) : searchResults?.length > 0 ? (
                    searchResults.map((project: Project) => (
                      <div
                        key={project.id}
                        className={`p-3 border rounded-md cursor-pointer hover:bg-accent transition-colors ${
                          selectedProject?.id === project.id
                            ? "bg-accent/80 border-primary"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedProject(project);
                          setIsOpen(false);
                        }}
                      >
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {project.overview}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-4 text-muted-foreground">
                      No projects found. Please create a project first.
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Thumbnail Assets */}
        <Card>
          <CardHeader>
            <CardTitle>Thumbnail Assets</CardTitle>
            <CardDescription>Upload images to use in your thumbnail</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-lg p-6">
              <div className="flex flex-col items-center">
                <Upload className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  Click to upload thumbnail assets
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, SVG formats accepted
                </p>
                <Input
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/jpeg,image/png,image/svg+xml"
                  onChange={handleFileChange}
                  id="thumbnail-assets"
                />
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => document.getElementById("thumbnail-assets")?.click()}
                >
                  Upload Files
                </Button>
              </div>
              {thumbnailAssets.length > 0 && (
                <div className="mt-4 space-y-2">
                  {thumbnailAssets.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-accent rounded-md"
                    >
                      <span className="text-sm truncate">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Channel Style */}
        <Card>
          <CardHeader>
            <CardTitle>Channel Style</CardTitle>
            <CardDescription>Select the style that best matches your channel</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={channelStyle} onValueChange={setChannelStyle}>
              <SelectTrigger className="w-full text-left py-6">
                <SelectValue placeholder="Select channel style" />
              </SelectTrigger>
              <SelectContent>
                {channelStyles.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    <div>
                      <div className="font-medium">{style.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {style.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Primary Thumbnail Goal */}
        <Card>
          <CardHeader>
            <CardTitle>Primary Thumbnail Goal</CardTitle>
            <CardDescription>What do you want to achieve with this thumbnail?</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={thumbnailGoal} onValueChange={setThumbnailGoal}>
              <SelectTrigger className="w-full text-left py-6">
                <SelectValue placeholder="Select thumbnail goal" />
              </SelectTrigger>
              <SelectContent>
                {thumbnailGoals.map((goal) => (
                  <SelectItem key={goal.value} value={goal.value}>
                    <div>
                      <div className="font-medium">{goal.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {goal.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Generation Method Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Generation Method</CardTitle>
            <CardDescription>Choose how you want to generate your thumbnail</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="youtube" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="youtube">Use a YouTube Video</TabsTrigger>
                <TabsTrigger value="templates">Choose from Templates</TabsTrigger>
              </TabsList>

              <TabsContent value="youtube" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">YouTube Video URL</h3>
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://youtube.com/watch?v=..."
                        value={inspirationUrl}
                        onChange={(e) => handleInspirationUrlChange(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        onClick={() => {
                          setInspirationUrl("");
                          setInspirationPreview(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Paste a YouTube video URL to use its thumbnail as inspiration
                    </p>
                  </div>

                  {inspirationPreview && (
                    <div className="relative aspect-video rounded-lg overflow-hidden border">
                      <img
                        src={inspirationPreview}
                        alt="Inspiration thumbnail preview"
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="text-white text-center p-4">
                          <p className="text-sm">Inspiration Thumbnail</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="templates" className="space-y-4">
                <div className="space-y-4">
                  <TemplateSelector
                    selectedTemplateIds={selectedTemplates}
                    onSelect={setSelectedTemplates}
                    maxSelections={5}
                  />
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Variations per Template</h3>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((num) => (
                        <Button
                          key={num}
                          variant={templateVariations === num ? "default" : "outline"}
                          onClick={() => setTemplateVariations(num)}
                        >
                          {num}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Additional Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Instructions</CardTitle>
            <CardDescription>Add any specific requirements or preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter any additional instructions or requirements for the thumbnail generation..."
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Proceed Button */}
        <Button
          onClick={handleGenerate}
          variant="brand"
          className="px-8 w-full text-center"
          disabled={!selectedProject}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Thumbnails
        </Button>
      </div>
    </div>
  );
} 