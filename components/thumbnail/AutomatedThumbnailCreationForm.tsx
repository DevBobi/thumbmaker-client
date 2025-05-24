import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NICHE_OPTIONS, SUB_NICHE_OPTIONS } from "./TemplateSelector.constants";

interface AutomatedFormData {
  title: string;
  category: string;
  subCategory: string;
  assets: File[];
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
  const [formData, setFormData] = useState<AutomatedFormData>({
    title: "",
    category: "",
    subCategory: "",
    assets: [],
    instructions: "",
  });
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleAssetsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, assets: files }));
    
    // Create preview URLs for all selected files
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Label className="py-2" htmlFor="assets">Thumbnail Assets</Label>
        <div className="border rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            {previewUrls.length > 0 ? (
              previewUrls.map((url, index) => (
                <div key={index} className="relative w-full aspect-video">
                  <img
                    src={url}
                    alt={`Asset preview ${index + 1}`}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-8 text-muted-foreground">
                No assets selected
              </div>
            )}
          </div>
          <Input
            id="assets"
            type="file"
            accept="image/*"
            multiple
            onChange={handleAssetsChange}
            className="hidden"
          />
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('assets')?.click()}
            >
              Upload Assets
            </Button>
            {formData.assets.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {formData.assets.length} files selected
              </span>
            )}
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