import React, { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";

interface MediaUploaderProps {
  files: File[];
  onAddFile: (file: File) => void;
  onRemoveFile: (index: number) => void;
  maxFiles?: number;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  files,
  onAddFile,
  onRemoveFile,
  maxFiles = Infinity,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (files.length + e.dataTransfer.files.length > maxFiles) {
        setError(`You can only upload a maximum of ${maxFiles} files`);
        return;
      }

      Array.from(e.dataTransfer.files).forEach((file) => {
        if (file.type.startsWith("image/")) {
          onAddFile(file);
        }
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);

    if (e.target.files && e.target.files.length > 0) {
      if (files.length + e.target.files.length > maxFiles) {
        setError(`You can only upload a maximum of ${maxFiles} files`);
      } else {
        Array.from(e.target.files).forEach((file) => {
          if (file.type.startsWith("image/")) {
            onAddFile(file);
          }
        });
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const filePreview = (file: File, index: number) => {
    const url = URL.createObjectURL(file);
    return (
      <div key={index} className="relative group">
        <Image
          src={url}
          alt={`Preview ${index + 1}`}
          width={96}
          height={96}
          className="h-24 w-24 object-cover rounded-md"
          unoptimized
          onLoad={() => URL.revokeObjectURL(url)}
        />
        <button
          type="button"
          onClick={() => onRemoveFile(index)}
          className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  };

  const isMaxFilesReached = files.length >= maxFiles;

  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-lg p-6 transition-colors text-center ${
          isDragging
            ? "border-primary bg-primary/5"
            : isMaxFilesReached
            ? "border-muted-foreground/10 bg-muted/20"
            : "border-muted-foreground/20"
        }`}
        onDragOver={isMaxFilesReached ? undefined : handleDragOver}
        onDragLeave={isMaxFilesReached ? undefined : handleDragLeave}
        onDrop={isMaxFilesReached ? undefined : handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          className="hidden"
          disabled={isMaxFilesReached}
        />

        <div className="flex flex-col items-center gap-2">
          <Upload
            className={`h-10 w-10 ${
              isMaxFilesReached
                ? "text-muted-foreground/50"
                : "text-muted-foreground"
            }`}
          />

          {isMaxFilesReached ? (
            <p className="text-lg font-medium text-muted-foreground/70">
              Maximum number of files reached
            </p>
          ) : (
            <>
              <p className="text-lg font-medium">Drag and drop images here</p>
              <p className="text-sm text-muted-foreground mb-2">or</p>
              <Button
                type="button"
                variant="outline"
                onClick={handleButtonClick}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Select Files
              </Button>
            </>
          )}

          <p className="text-xs text-muted-foreground mt-2">
            Supports: JPG, PNG, GIF, SVG (Max 5MB per file)
            {maxFiles < Infinity && ` • Maximum ${maxFiles} files`}
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-2 text-destructive text-sm flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">
            Uploaded Images ({files.length}
            {maxFiles < Infinity && ` of ${maxFiles}`})
          </h4>
          <div className="flex flex-wrap gap-3">
            {files.map((file, index) => filePreview(file, index))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
