"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useFreeCredits } from "@/hooks/use-free-credits";

export const GuaranteePopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoading, error, handleGetFreeCredits } = useFreeCredits();

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem("hasSeenGuaranteePopup");
    if (!hasSeenPopup) {
      setIsOpen(true);
      localStorage.setItem("hasSeenGuaranteePopup", "true");
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-background border-border shadow-lg rounded-lg">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-center">
            <div className="p-3 rounded-full bg-brand-50 dark:bg-brand-900/20">
              <Sparkles className="h-8 w-8 text-brand-600" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-center text-foreground">
            Money Back Guarantee
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <p className="text-center text-muted-foreground leading-relaxed">
              We're confident in our service. If you're not completely satisfied
              with your first 10 ad generations, we'll provide a full refund -
              no questions asked.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <div className="h-1 w-1 rounded-full bg-muted-foreground" />
              <span>Try risk free</span>
              <div className="h-1 w-1 rounded-full bg-muted-foreground" />
              <span>No hidden terms</span>
              <div className="h-1 w-1 rounded-full bg-muted-foreground" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
