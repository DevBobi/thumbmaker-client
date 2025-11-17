"use client";

import * as React from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  onSave?: () => void;
  onCancel?: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  isSaving?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  hideFooter?: boolean;
  hideSaveButton?: boolean;
  footerActions?: React.ReactNode;
}

const sizeClasses = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-2xl",
  lg: "sm:max-w-4xl",
  xl: "sm:max-w-6xl",
};

export function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSave,
  onCancel,
  saveLabel = "Save changes",
  cancelLabel = "Cancel",
  isLoading = false,
  isSaving = false,
  size = "md",
  hideFooter = false,
  hideSaveButton = false,
  footerActions,
}: FormSheetProps) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn("flex flex-col p-0 w-full bg-background", sizeClasses[size])}
      >
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            children
          )}
        </div>

        {!hideFooter && (
          <SheetFooter className="px-6 py-4 border-t mt-auto">
            <div className="flex gap-3 w-full justify-end">
              {footerActions ? (
                footerActions
              ) : (
                <>
                  <SheetClose asChild>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="min-w-[100px]"
                    >
                      {cancelLabel}
                    </Button>
                  </SheetClose>
                  {!hideSaveButton && onSave && (
                    <Button
                      type="button"
                      onClick={onSave}
                      disabled={isSaving || isLoading}
                      className="min-w-[100px]"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        saveLabel
                      )}
                    </Button>
                  )}
                </>
              )}
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}


