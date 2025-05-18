"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus } from "lucide-react";

// Mock data - replace with real data from your backend
const MOCK_TEMPLATES = [
  {
    id: 1,
    name: "Modern Tech Review",
    description: "Perfect for tech product reviews and unboxings",
    thumbnail: "/templates/tech-review.jpg",
    niche: "Technology",
    subNiche: "Product Reviews",
  },
  {
    id: 2,
    name: "Educational Tutorial",
    description: "Great for step-by-step tutorials and how-to videos",
    thumbnail: "/templates/tutorial.jpg",
    niche: "Education",
    subNiche: "Tutorials",
  },
  // Add more mock templates...
];

const NICHES = ["Technology", "Education", "Gaming", "Lifestyle", "Business"];
const SUB_NICHES = {
  Technology: ["Product Reviews", "Programming", "Tech News", "Gadgets"],
  Education: ["Tutorials", "Courses", "Study Tips", "Academic"],
  // Add more sub-niches...
};

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("");
  const [selectedSubNiche, setSelectedSubNiche] = useState("");

  const filteredTemplates = MOCK_TEMPLATES.filter((template) => {
    const matchesSearch = template.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesNiche = !selectedNiche || template.niche === selectedNiche;
    const matchesSubNiche =
      !selectedSubNiche || template.subNiche === selectedSubNiche;
    return matchesSearch && matchesNiche && matchesSubNiche;
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Thumbnail Templates</h1>
          <p className="text-lg text-muted-foreground">
            Choose a template to start with
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
              <DialogDescription>
                Create a new template from a YouTube video
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="youtube-link">YouTube Video Link</Label>
                <Input
                  id="youtube-link"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="niche">Niche</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select niche" />
                  </SelectTrigger>
                  <SelectContent>
                    {NICHES.map((niche) => (
                      <SelectItem key={niche} value={niche}>
                        {niche}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sub-niche">Sub-niche</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sub-niche" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedNiche &&
                      SUB_NICHES[selectedNiche as keyof typeof SUB_NICHES]?.map(
                        (subNiche) => (
                          <SelectItem key={subNiche} value={subNiche}>
                            {subNiche}
                          </SelectItem>
                        )
                      )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Create Template</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedNiche} onValueChange={setSelectedNiche}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select niche" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Niches</SelectItem>
            {NICHES.map((niche) => (
              <SelectItem key={niche} value={niche}>
                {niche}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={selectedSubNiche}
          onValueChange={setSelectedSubNiche}
          disabled={!selectedNiche}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select sub-niche" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Sub-niches</SelectItem>
            {selectedNiche &&
              SUB_NICHES[selectedNiche as keyof typeof SUB_NICHES]?.map(
                (subNiche) => (
                  <SelectItem key={subNiche} value={subNiche}>
                    {subNiche}
                  </SelectItem>
                )
              )}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg">
                {/* Replace with actual thumbnail image */}
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Thumbnail Preview
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                {template.niche} • {template.subNiche}
              </div>
              <Button>Use Template</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 