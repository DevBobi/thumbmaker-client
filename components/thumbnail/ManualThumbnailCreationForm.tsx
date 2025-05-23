import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CONTENT_OPTIONS, NICHE_OPTIONS, SUB_NICHE_OPTIONS } from "./TemplateSelector.constants";

interface ManualFormData {
  title: string;
  category: string;
  subCategory: string;
  contentType: string;
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
    category: "",
    subCategory: "",
    contentType: "",
    thumbnail: null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Label className="py-2" htmlFor="thumbnail">Thumbnail Preview</Label>
        <div className="border rounded-lg p-4 justify-center items-center flex flex-col">
          {previewUrl ? (
            <div className="relative w-32 h-20">
              <img
                src={previewUrl}
                alt="Thumbnail preview"
                className="w-full h-full object-cover rounded"
              />
            </div>
          ) : (
            <div className="relative w-32 h-20 text-center">
              No image
            </div>
          )}
          <div className="mt-2">
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="py-2" htmlFor="category">Niche</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select niche" />
              </SelectTrigger>
              <SelectContent>
                {NICHE_OPTIONS.filter(opt => opt.value !== "all").map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="py-2" htmlFor="subCategory">Sub Niche</Label>
            <Select
              value={formData.subCategory}
              onValueChange={(value) => setFormData(prev => ({ ...prev, subCategory: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sub niche" />
              </SelectTrigger>
              <SelectContent>
                {SUB_NICHE_OPTIONS.filter(opt => opt.value !== "all").map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="py-2" htmlFor="contentType">Content Type</Label>
          <Select
            value={formData.contentType}
            onValueChange={(value) => setFormData(prev => ({ ...prev, contentType: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select content type" />
            </SelectTrigger>
            <SelectContent>
              {CONTENT_OPTIONS.filter(opt => opt.value !== "all").map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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