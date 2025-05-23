"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ManualThumbnailCreationForm from "./ManualThumbnailCreationForm";
import AutomatedThumbnailCreationForm from "./AutomatedThumbnailCreationForm";

interface CreateTemplateThumbnailProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const CreateTemplateThumbnail = ({
  isOpen,
  onClose,
  onSubmit,
}: CreateTemplateThumbnailProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("manual");

  const handleManualSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('category', formData.category);
      submitData.append('subCategory', formData.subCategory);
      submitData.append('contentType', formData.contentType);
      if (formData.thumbnail) {
        submitData.append('thumbnail', formData.thumbnail);
      }

      const response = await fetch('/api/templates', {
        method: 'POST',
        body: submitData,
      });

      if (!response.ok) {
        throw new Error('Failed to create template');
      }

      const data = await response.json();
      
      toast({
        title: "Success!",
        description: "Template created successfully",
        variant: "default",
      });

      onSubmit(data);
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutomatedSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('category', formData.category);
      submitData.append('subCategory', formData.subCategory);
      submitData.append('instructions', formData.instructions);
      formData.assets.forEach((file: File, index: number) => {
        submitData.append(`asset_${index}`, file);
      });

      const response = await fetch('/api/templates/automated', {
        method: 'POST',
        body: submitData,
      });

      if (!response.ok) {
        throw new Error('Failed to create template');
      }

      const data = await response.json();
      
      toast({
        title: "Success!",
        description: "Template generation started successfully",
        variant: "default",
      });

      onSubmit(data);
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start template generation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Create New Template</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

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
      </div>
    </div>
  );
};

export default CreateTemplateThumbnail;


