"use client";

import { UploadButton, UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "~/lib/uploadthing";
import { X } from "lucide-react";
import { Button } from "./button";
import { cn } from "~/lib/utils";

interface UploadThingProps {
  endpoint: "imageUploader" | "fileUploader";
  onUploadComplete?: (url: string) => void;
  onUploadError?: (error: Error) => void;
  value?: string;
  onRemove?: () => void;
  className?: string;
  variant?: "button" | "dropzone";
  disabled?: boolean;
}

export function UploadThing({
  endpoint,
  onUploadComplete,
  onUploadError,
  value,
  onRemove,
  className,
  variant = "dropzone",
  disabled = false,
}: UploadThingProps) {
  const handleUploadComplete = (res: Array<{ url: string }>) => {
    if (res && res[0]?.url) {
      onUploadComplete?.(res[0].url);
    }
  };

  const handleUploadError = (error: Error) => {
    console.error("Upload error:", error);
    onUploadError?.(error);
  };

  if (value) {
    return (
      <div className={cn("relative group", className)}>
        <div className="border-2 border-border rounded-lg p-4 bg-muted/30">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {value.split("/").pop() || "Uploaded file"}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-1">
                {value}
              </p>
            </div>
            {onRemove && !disabled && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onRemove}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {endpoint === "imageUploader" && (
            <div className="mt-4">
              <img
                src={value}
                alt="Uploaded"
                className="max-w-full max-h-48 rounded-lg object-contain"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (disabled) {
    return (
      <div className={cn(
        "mt-2 flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 text-center",
        "bg-muted/30 cursor-not-allowed opacity-50",
        className
      )}>
        <p className="text-sm text-muted-foreground">
          Choose a file or drag and drop
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {endpoint === "imageUploader" ? "Images" : "Images and PDFs"}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          (Preview only - uploads disabled in editor)
        </p>
      </div>
    );
  }

  if (variant === "button") {
    return (
      <UploadButton<OurFileRouter>
        endpoint={endpoint}
        onClientUploadComplete={handleUploadComplete}
        onUploadError={handleUploadError}
        className={className}
      />
    );
  }

  return (
    <UploadDropzone<OurFileRouter>
      endpoint={endpoint}
      onClientUploadComplete={handleUploadComplete}
      onUploadError={handleUploadError}
      className={cn("ut-label:text-sm ut-allowed-content:text-xs", className)}
    />
  );
}

