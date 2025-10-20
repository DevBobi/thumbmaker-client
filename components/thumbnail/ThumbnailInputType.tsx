import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bot, PencilIcon } from "lucide-react";

interface ThumbnailInputTypeProps {
  onSelect: (type: "automated" | "manual") => void;
}

const ThumbnailInputType = ({ onSelect }: ThumbnailInputTypeProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card 
        className="p-6 hover:border-primary cursor-pointer transition-all"
        onClick={() => onSelect("automated")}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <Bot className="w-12 h-12 text-primary" />
          <h3 className="text-xl font-semibold">Automated Generation</h3>
          <p className="text-muted-foreground">
            Let AI generate thumbnails based on your video content automatically
          </p>
          <Button variant="outline" className="mt-2">
            Choose Automated
          </Button>
        </div>
      </Card>

      <Card 
        className="p-6 hover:border-primary cursor-pointer transition-all"
        onClick={() => onSelect("manual")}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <PencilIcon className="w-12 h-12 text-primary" />
          <h3 className="text-xl font-semibold">Manual Generation</h3>
          <p className="text-muted-foreground">
            Customize every aspect of your thumbnail manually
          </p>
          <Button variant="outline" className="mt-2">
            Choose Manual
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ThumbnailInputType; 