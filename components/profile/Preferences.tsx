"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export const Preferences = () => {
  const { theme, setTheme } = useTheme();
  return (
    <Card className="mt-6 rounded-lg">
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Dark Mode</h4>
            <p className="text-sm text-muted-foreground">
              Toggle between light and dark themes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            <Switch
              checked={theme === "dark"}
              onCheckedChange={() =>
                setTheme(theme === "dark" ? "light" : "dark")
              }
            />
            <Moon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
