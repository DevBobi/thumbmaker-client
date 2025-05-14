import Zoom from "react-medium-image-zoom";
import Image from "next/image";
import { Button } from "../ui/button";
import { Download } from "lucide-react";

interface GeneratedAd {
  id: string;
  title: string;
  description: string;
  aspectRatio: string;
  image: string;
  createdAt: string;
}

export const GeneratedAdCard = ({
  download,
  ad,
}: {
  download: () => void;
  ad: GeneratedAd;
}) => {
  return (
    <div
      key={ad.id}
      className={`relative border rounded-md overflow-hidden cursor-pointer group transition-all hover:shadow-md`}
    >
      <Zoom
        zoomImg={{
          src: ad.image,
          alt: ad.title,
          // Remove fixed dimensions to allow full resolution
          // The image will scale based on its natural dimensions
        }}
        zoomMargin={40}
        classDialog="custom-zoom"
      >
        <div className="relative w-full aspect-[4/3]">
          <Image
            src={ad.image}
            alt={ad.title}
            fill
            quality={100} // Set maximum quality
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" // Increased size estimates
            className="object-cover"
            priority={true} // Prioritize loading for better user experience
          />
        </div>
      </Zoom>
      <div className="p-3 bg-background">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
            <Button
              variant="secondary"
              size="icon"
              onClick={download}
              className="cursor-pointer"
            >
              <Download className="h-4 w-4" />
            </Button>
            <div>
              <p className="text-[10px] text-muted-foreground truncate">
                Aspect Ratio
              </p>
              <div className="text-[12px] py-0.5 ">{ad.aspectRatio}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
