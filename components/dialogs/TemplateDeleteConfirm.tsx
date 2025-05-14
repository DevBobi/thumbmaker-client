import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useAuthFetch } from "@/hooks/use-auth-fetch";

interface TemplateDeleteConfirmProps {
  templateId: string;
  templateName?: string;
  onDelete: (templateId: string) => void;
  trigger?: React.ReactNode;
  className?: string;
}

const TemplateDeleteConfirm: React.FC<TemplateDeleteConfirmProps> = ({
  templateId,
  templateName = "this template",
  onDelete,
  trigger,
  className,
}) => {
  const { authFetch } = useAuthFetch();
  const [open, setOpen] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      
      const response = await authFetch(`/api/templates/${templateId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete template");
      }
      
      onDelete(templateId);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      console.error("Error deleting template:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className={`text-red-600 hover:text-red-700 hover:bg-red-50 ${className}`}
          >
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Template</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {templateName}? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateDeleteConfirm;
