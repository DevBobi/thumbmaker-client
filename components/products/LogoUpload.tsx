import React, { useRef } from "react";
import NextImage from "next/image";
import { Button } from "@/components/ui/button";
import { Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LogoUploadProps {
  logoPreview: string | null;
  setLogo: (file: File | null) => void;
  setLogoPreview: (preview: string | null) => void;
}

const LogoUpload: React.FC<LogoUploadProps> = ({
  logoPreview,
  setLogo,
  setLogoPreview,
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogo(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      toast({
        title: "Logo uploaded",
        description: `${file.name} has been uploaded.`,
      });
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col items-center justify-center gap-4">
        {logoPreview ? (
          <div className="relative w-32 h-32 mb-2">
            <NextImage
              src={logoPreview}
              alt="Logo preview"
              width={128}
              height={128}
              className="w-full h-full object-contain border rounded-md p-2"
              unoptimized
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              onClick={() => {
                setLogo(null);
                setLogoPreview(null);
              }}
            >
              ×
            </Button>
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-md cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image className="h-10 w-10 text-muted-foreground" />
            <span className="text-xs text-muted-foreground mt-2">
              Click to upload
            </span>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/svg+xml"
          className="hidden"
          onChange={handleLogoChange}
        />
        {!logoPreview && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Logo
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Supported formats: PNG, JPG, JPEG, SVG
      </p>
    </div>
  );
};

export default LogoUpload;
