import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface ManualFormData {
  title: string;
  tags: string[];
  thumbnail: File | null;
}

interface ManualThumbnailCreationFormProps {
  onSubmit: (data: ManualFormData) => void;
  onClose: () => void;
  isSubmitting: boolean;
}

const ManualThumbnailCreationForm = ({
  onSubmit,
  onClose,
  isSubmitting,
}: ManualThumbnailCreationFormProps) => {
  const [formData, setFormData] = useState<ManualFormData>({
    title: "",
    tags: [],
    thumbnail: null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, thumbnail: file }));
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
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
        <Label className="py-2" htmlFor="thumbnail">Thumbnail Preview</Label>
        <div className="border rounded-lg p-4 justify-center items-center flex flex-col">
          {previewUrl ? (
            <div className="relative aspect-video w-full max-w-2xl rounded-lg overflow-hidden">
              <img
                src={previewUrl}
                alt="Thumbnail preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="text-white text-center p-4">
                  <p className="text-sm">Thumbnail Preview</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative aspect-video w-full max-w-2xl rounded-lg border-2 border-dashed flex items-center justify-center text-muted-foreground">
              No image selected
            </div>
          )}
          <div className="mt-4">
            <Input
              id="thumbnail"
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="hidden"
            />
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('thumbnail')?.click()}
              >
                Upload Thumbnail
              </Button>
            </div>
          </div>
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
          {isSubmitting ? "Creating..." : "Create Template"}
        </Button>
      </div>
    </form>
  );
};

export default ManualThumbnailCreationForm; 