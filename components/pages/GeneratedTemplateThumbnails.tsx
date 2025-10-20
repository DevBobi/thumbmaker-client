"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from 'next/navigation'

// Mock data for generated thumbnails
const MOCK_GENERATED_THUMBNAILS = [
  {
    id: "1",
    title: "Gaming Action",
    image: "https://picsum.photos/1280/720?random=1",
    tags: ["gaming", "action"],
    creator: "AI Generator",
    createdAt: "2024-03-20T10:00:00Z",
  },
  {
    id: "2",
    title: "Tech Review",
    image: "https://picsum.photos/1280/720?random=2",
    tags: ["tech", "review"],
    creator: "AI Generator",
    createdAt: "2024-03-20T10:00:00Z",
  },
  {
    id: "3",
    title: "Vlog Style",
    image: "https://picsum.photos/1280/720?random=3",
    tags: ["vlog", "lifestyle"],
    creator: "AI Generator",
    createdAt: "2024-03-20T10:00:00Z",
  },
  {
    id: "4",
    title: "Tutorial",
    image: "https://picsum.photos/1280/720?random=4",
    tags: ["tutorial", "education"],
    creator: "AI Generator",
    createdAt: "2024-03-20T10:00:00Z",
  },
];

const GeneratedTemplateThumbnailsPage = () => {
  const params = useParams<{ id: string }>();
  // In a real app, we would fetch the data based on the ID
  const templateData = {
    id: params.id,
    title: "My Generated Template",
    inspirationUrl: "https://youtube.com/watch?v=example",
    tags: ["gaming", "action", "tech"],
    instructions: "Create a gaming thumbnail with action elements",
    thumbnails: MOCK_GENERATED_THUMBNAILS,
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/create-youtube-thumbnail">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{templateData.title}</h1>
            <p className="text-sm text-muted-foreground">
              Generated on {new Date(templateData.thumbnails[0].createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {templateData.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Generated Thumbnails Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templateData.thumbnails.map((thumbnail) => (
          <div
            key={thumbnail.id}
            className="group relative aspect-video rounded-lg overflow-hidden border"
          >
            <Image
              src={thumbnail.image}
              alt={thumbnail.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="flex gap-2">
                <Button variant="secondary" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="secondary" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default GeneratedTemplateThumbnailsPage; 