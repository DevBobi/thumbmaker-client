import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

export type AdDimensionGroup = {
  id: string;
  name: string;
  description: string;
  aspectRatios: string;
  platforms: string[];
  primaryRatio: string; // Primary aspect ratio to use when selected
};

interface AdDimensionSelectorProps {
  selectedGroup: string | null;
  onChange: (groupId: string, primaryRatio: string) => void;
}

const AdDimensionSelector: React.FC<AdDimensionSelectorProps> = ({
  selectedGroup,
  onChange,
}) => {
  // Ad dimension groups based on the provided table
  const dimensionGroups: AdDimensionGroup[] = [
    {
      id: "feed-gallery",
      name: "Feed & Gallery Ads",
      description:
        "Ideal for typical feed and carousel placements on Facebook and Instagram where a square or slightly portrait (4:5) format works best.",
      aspectRatios: "(1:1, 4:5)",
      platforms: ["Facebook", "Instagram"],
      primaryRatio: "1:1", // Square format as primary
    },
    {
      id: "widescreen-display",
      name: "Widescreen Video & Display Ads",
      description:
        "Perfect for formats that favor a landscape look, such as YouTube in-stream videos and desktop display ads on Facebook/Instagram.",
      aspectRatios: "(3:2, 16:9, 4:3)",
      platforms: ["YouTube", "Desktop Display"],
      primaryRatio: "3:2", // Landscape format as primary
    },
    {
      id: "story-vertical",
      name: "Story & Mobile Vertical Ads",
      description:
        "Optimized for mobile-first, full-screen vertical formats like Stories (and Reels) on Facebook and Instagram.",
      aspectRatios: "(2:3, 9:16)",
      platforms: ["Facebook Stories", "Instagram Stories", "Reels"],
      primaryRatio: "2:3", // Portrait format as primary
    },
  ];

  return (
    <div className="space-y-4">
      {dimensionGroups.map((group) => (
        <Card
          key={group.id}
          className={`cursor-pointer transition-all hover:border-brand-400 ${
            selectedGroup === group.id
              ? "border-2 border-brand-500 bg-brand-50 dark:bg-brand-900/10"
              : "border border-border hover:shadow-md"
          }`}
          onClick={() => onChange(group.id, group.primaryRatio)}
        >
          <CardContent>
            <div className="flex items-center gap-3">
              <div
                className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border ${
                  selectedGroup === group.id
                    ? "bg-brand-500 border-brand-500 flex items-center justify-center"
                    : "border-gray-300"
                }`}
              >
                {selectedGroup === group.id && (
                  <Check className="h-3 w-3 text-white" />
                )}
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-base">{group.name}</h3>
                  <div className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                    {group.aspectRatios}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {group.description}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {group.platforms.map((platform) => (
                    <span
                      key={platform}
                      className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdDimensionSelector;
