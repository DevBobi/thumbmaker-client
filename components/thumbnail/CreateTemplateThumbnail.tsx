"use client";

import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ManualThumbnailCreationForm from "./ManualThumbnailCreationForm";
import AutomatedThumbnailCreationForm from "./AutomatedThumbnailCreationForm";
import { FormSheet } from "@/components/ui/form-sheet";

interface CreateTemplateThumbnailProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  selectedTemplate?: any;
  selectedProject?: any;
}

const CreateTemplateThumbnail = ({
  isOpen,
  onClose,
  onSubmit,
  selectedTemplate,
  selectedProject,
}: CreateTemplateThumbnailProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("manual");

  const handleManualSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      // Upload thumbnail image first if provided
      let imageUrl = '';
      if (formData.thumbnail) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', formData.thumbnail);
        
        const { uploadToStorage } = await import('@/actions/upload');
        const uploadResult = await uploadToStorage(uploadFormData);
        
        if (!uploadResult.success || !uploadResult.fileUrl) {
          throw new Error('Failed to upload thumbnail image');
        }
        
        imageUrl = uploadResult.fileUrl;
      }

      // Create thumbnail with uploaded image URL and selected template/project
      const thumbnailData = {
        title: formData.title || selectedProject?.title || '',
        description: `${formData.category} - ${formData.subCategory}`,
        image: imageUrl,
        tags: [formData.category, formData.subCategory, formData.contentType].filter(Boolean),
        templateId: selectedTemplate?.id,
        projectId: selectedProject?.id,
      };

      const response = await fetch('/api/thumbnails/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(thumbnailData),
      });

      if (!response.ok) {
        throw new Error('Failed to create thumbnail');
      }

      const data = await response.json();
      
      toast({
        title: "Success!",
        description: "Thumbnail created successfully",
        variant: "default",
      });

      onSubmit(data);
      
      // Keep loading state and close after brief delay for smooth transition
      setTimeout(() => {
        onClose();
        setIsSubmitting(false);
      }, 300);
    } catch (error) {
      console.error('Error creating thumbnail:', error);
      toast({
        title: "Error",
        description: "Failed to create thumbnail. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const handleAutomatedSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      // Upload all assets first
      const { uploadToStorage } = await import('@/actions/upload');
      const uploadPromises = formData.assets.map(async (file: File) => {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        const result = await uploadToStorage(uploadFormData);
        if (!result.success || !result.fileUrl) {
          throw new Error(`Failed to upload ${file.name}`);
        }
        return result.fileUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      // For automated generation, we'll use the first uploaded image as the thumbnail
      // The instructions can be stored in description
      const thumbnailData = {
        title: formData.title || selectedProject?.title || '',
        description: formData.instructions || '',
        image: uploadedUrls[0] || '',
        tags: [formData.category, formData.subCategory].filter(Boolean),
        templateId: selectedTemplate?.id,
        projectId: selectedProject?.id,
      };

      const response = await fetch('/api/thumbnails/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(thumbnailData),
      });

      if (!response.ok) {
        throw new Error('Failed to create thumbnail');
      }

      const data = await response.json();
      
      toast({
        title: "Success!",
        description: "Thumbnail generation started successfully",
        variant: "default",
      });

      onSubmit(data);
      
      // Keep loading state and close after brief delay for smooth transition
      setTimeout(() => {
        onClose();
        setIsSubmitting(false);
      }, 300);
    } catch (error) {
      console.error('Error starting thumbnail generation:', error);
      toast({
        title: "Error",
        description: "Failed to start thumbnail generation. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <FormSheet
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Create YouTube Thumbnail"
      description={
        selectedTemplate && selectedProject 
          ? `Creating thumbnail for "${selectedProject.title}" using "${selectedTemplate.title}" template`
          : "Choose between manual creation or automated generation"
      }
      hideFooter={true}
      size="md"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual Creation</TabsTrigger>
          <TabsTrigger value="automated">Automated Generation</TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <ManualThumbnailCreationForm
            onSubmit={handleManualSubmit}
            onClose={onClose}
            isSubmitting={isSubmitting}
          />
        </TabsContent>

        <TabsContent value="automated">
          <AutomatedThumbnailCreationForm
            onSubmit={handleAutomatedSubmit}
            onClose={onClose}
            isSubmitting={isSubmitting}
          />
        </TabsContent>
      </Tabs>
    </FormSheet>
  );
};

export default CreateTemplateThumbnail;


