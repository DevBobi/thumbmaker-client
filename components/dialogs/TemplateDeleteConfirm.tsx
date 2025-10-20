import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className={`text-red-600 hover:text-red-700 hover:bg-red-50 ${className}`}
          >
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="sm:max-w-[425px]" side="right">
        <SheetHeader>
          <SheetTitle>Delete Template</SheetTitle>
          <SheetDescription>
            Are you sure you want to delete {templateName}? This action cannot
            be undone.
          </SheetDescription>
        </SheetHeader>
        <SheetFooter className="flex-row gap-2 mt-auto">
          <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="flex-1">
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default TemplateDeleteConfirm;
