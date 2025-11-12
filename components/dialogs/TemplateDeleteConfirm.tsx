import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Trash2 } from "lucide-react";
import React, { useState } from "react";

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
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    setOpen(false);
    onDelete(templateId);
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
          <Button variant="destructive" onClick={handleDelete} className="flex-1">
            Delete
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default TemplateDeleteConfirm;
