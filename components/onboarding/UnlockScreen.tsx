"use client";

import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface UnlockScreenProps {
  onStartTrial: () => void;
}

export default function UnlockScreen({ onStartTrial }: UnlockScreenProps) {
  return (
    <div className="flex items-center justify-center w-full py-10 px-4">
      <Card className="w-full max-w-md border-2 bg-gradient-to-br from-background to-muted/20">
        <CardContent className="p-8 space-y-6">
          {/* Lock Icon */}
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-brand-50 dark:bg-brand-900/20 border-2 border-brand-200 dark:border-brand-800">
              <Lock className="h-8 w-8 text-brand-600 dark:text-brand-400" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Unlock your masterpiece</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your thumbnail is ready! Start your free trial to view and
              download without watermarks.
            </p>
          </div>

          {/* CTA Button */}
          <Button
            size="lg"
            className="w-full bg-gray-900 hover:bg-gray-800 text-white gap-2"
            onClick={onStartTrial}
          >
            <Sparkles className="h-4 w-4" />
            Start 7-Day Free Trial
          </Button>

          {/* Footer Text */}
          <p className="text-center text-xs text-muted-foreground">
            No charge until trial ends. Cancel anytime.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

