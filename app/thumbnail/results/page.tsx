"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Download, Copy, Check, RefreshCw } from "lucide-react";

// Mock data - replace with real data from your backend
const MOCK_RESULTS = [
  {
    id: 1,
    imageUrl: "/thumbnails/result-1.jpg",
    template: "Modern Tech Review",
    score: 0.92,
  },
  {
    id: 2,
    imageUrl: "/thumbnails/result-2.jpg",
    template: "Educational Tutorial",
    score: 0.87,
  },
  // Add more mock results...
];

export default function ResultsPage() {
  const [selectedThumbnail, setSelectedThumbnail] = useState<number | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState<number[]>([]);

  const handleDownload = (id: number) => {
    // TODO: Implement download functionality
    console.log("Downloading thumbnail", id);
  };

  const handleCopy = (id: number) => {
    // TODO: Implement copy functionality
    console.log("Copying thumbnail", id);
    setCopied((prev) => [...prev, id]);
    setTimeout(() => {
      setCopied((prev) => prev.filter((copyId) => copyId !== id));
    }, 2000);
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    // TODO: Implement regeneration functionality
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Mock API call
    setRegenerating(false);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Generated Thumbnails</h1>
          <p className="text-lg text-muted-foreground">
            Choose your preferred thumbnail or generate more options
          </p>
        </div>
        <Button
          onClick={handleRegenerate}
          disabled={regenerating}
          variant="outline"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${regenerating ? "animate-spin" : ""}`}
          />
          Generate More
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_RESULTS.map((result) => (
          <Card
            key={result.id}
            className={`transition-all ${
              selectedThumbnail === result.id
                ? "ring-2 ring-primary"
                : "hover:border-primary"
            }`}
          >
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Variation {result.id}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Score: {(result.score * 100).toFixed(0)}%
                </span>
              </CardTitle>
              <CardDescription>Based on {result.template}</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="aspect-video bg-muted rounded-lg cursor-pointer"
                onClick={() => setSelectedThumbnail(result.id)}
              >
                {/* Replace with actual thumbnail image */}
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Thumbnail Preview
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopy(result.id)}
                    >
                      {copied.includes(result.id) ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy to clipboard</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDownload(result.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download thumbnail</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedThumbnail && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Selected: Variation {selectedThumbnail}</h3>
              <p className="text-sm text-muted-foreground">
                Ready to use this thumbnail?
              </p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setSelectedThumbnail(null)}>
                Cancel
              </Button>
              <Button>Use This Thumbnail</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 