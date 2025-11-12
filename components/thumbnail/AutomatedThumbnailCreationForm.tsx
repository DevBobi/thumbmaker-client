import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

interface AutomatedFormData {
  title: string;
  tags: string[];
  inspirationUrl: string;
  instructions: string;
}

interface AutomatedThumbnailCreationFormProps {
  onSubmit: (data: AutomatedFormData) => void;
  onClose: () => void;
  isSubmitting: boolean;
}

const AutomatedThumbnailCreationForm = ({
  onSubmit,
  onClose,
  isSubmitting,
}: AutomatedThumbnailCreationFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState<AutomatedFormData>({
    title: "",
    tags: [],
    inspirationUrl: "",
    instructions: "",
  });
  const [tagInput, setTagInput] = useState("");
  const [inspirationPreview, setInspirationPreview] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    router.push(`/dashboard/generated-template-thumbnails/${Date.now()}`);
  };

  const handleInspirationUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, inspirationUrl: url }));
    
    // Extract video ID and create thumbnail URL
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
    if (videoId) {
      setInspirationPreview(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
    } else {
      setInspirationPreview(null);
    }
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">YouTube Video URL</h3>
          <div className="flex gap-2">
            <Input
              placeholder="https://youtube.com/watch?v=..."
              value={formData.inspirationUrl}
              onChange={(e) => handleInspirationUrlChange(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={() => {
                setFormData(prev => ({ ...prev, inspirationUrl: "" }));
                setInspirationPreview(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Paste a YouTube video URL to use its thumbnail as inspiration
          </p>

          {inspirationPreview && (
            <div className="mt-4 relative aspect-video rounded-lg overflow-hidden border max-w-2xl">
              <Image
                src={inspirationPreview}
                alt="Inspiration thumbnail preview"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 896px"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="text-white text-center p-4">
                  <p className="text-sm">Inspiration Thumbnail</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <Label className="py-2" htmlFor="title">Template Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter template title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="py-2" htmlFor="tags">Tags</Label>
          <div className="flex flex-wrap gap-2 p-2 border rounded-md">
            {formData.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <Input
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              placeholder="Type and press Enter to add tags"
              className="flex-1 min-w-[200px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-8"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Press Enter or comma to add a tag
          </p>
        </div>

        <div>
          <Label className="py-2" htmlFor="instructions">Additional Instructions</Label>
          <Textarea
            id="instructions"
            value={formData.instructions}
            onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
            placeholder="Enter any additional instructions for the AI"
            className="min-h-[100px]"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="brand"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Generating..." : "Generate Template"}
        </Button>
      </div>
    </form>
  );
};

export default AutomatedThumbnailCreationForm; 