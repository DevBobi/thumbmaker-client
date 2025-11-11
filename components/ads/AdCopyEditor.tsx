import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AdCopy } from "@/contexts/AdContext";
import { toast } from "@/hooks/use-toast";
import { Pencil, Save } from "lucide-react";
import React, { useState } from "react";

interface AdCopyEditorProps {
  copy: AdCopy;
  onSave: (updatedCopy: AdCopy) => void;
}

const AdCopyEditor: React.FC<AdCopyEditorProps> = ({
  copy,
  onSave,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editedCopy, setEditedCopy] = useState<AdCopy>({ ...copy });

  const handleEdit = () => {
    setEditedCopy({ ...copy });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    onSave(editedCopy);
    setIsDialogOpen(false);

    toast({
      title: "Ad copy updated",
      description: "Your changes have been saved",
    });
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  const handleInputChange = (field: keyof AdCopy, value: string) => {
    setEditedCopy((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Render markdown content as React elements
  const renderAdCopyPreview = () => {
    return (
      <div className="space-y-4">
        <div className="border-b pb-3">
          <h3 className="text-base font-semibold text-primary mb-1">
            Headline
          </h3>
          <p className="text-lg font-medium">{copy.headline}</p>
        </div>

        <div className="border-b pb-3">
          <h3 className="text-base font-semibold text-primary mb-1">
            Subtitle
          </h3>
          <p className="text-base text-muted-foreground">{copy.subtitle}</p>
        </div>

        <div className="border-b pb-3">
          <h3 className="text-base font-semibold text-primary mb-1">
            Body Text
          </h3>
          <p className="whitespace-pre-wrap">{copy.bodyText}</p>
        </div>

        <div>
          <h3 className="text-base font-semibold text-primary mb-1">
            Call to Action
          </h3>
          <p className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-md font-medium">
            {copy.callToAction}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-medium">Ad Copy</h3>

        <Button size="sm" variant="outline" onClick={handleEdit}>
          <Pencil className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </div>

      {renderAdCopyPreview()}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Ad Copy</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                value={editedCopy.headline}
                onChange={(e) => handleInputChange("headline", e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={editedCopy.subtitle}
                onChange={(e) => handleInputChange("subtitle", e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bodyText">Body Text</Label>
              <Textarea
                id="bodyText"
                value={editedCopy.bodyText}
                onChange={(e) => handleInputChange("bodyText", e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="callToAction">Call to Action</Label>
              <Input
                id="callToAction"
                value={editedCopy.callToAction}
                onChange={(e) =>
                  handleInputChange("callToAction", e.target.value)
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdCopyEditor;
