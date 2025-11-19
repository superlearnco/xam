"use client";

import { useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "./button";
import { cn } from "~/lib/utils";

interface FileUploadProps {
  endpoint: "imageUploader" | "fileUploader";
  onUploadComplete?: (url: string) => void;
  onUploadError?: (error: Error) => void;
  value?: string;
  onRemove?: () => void;
  className?: string;
  variant?: "button" | "dropzone";
  disabled?: boolean;
}

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

export function FileUpload({
  endpoint,
  onUploadComplete,
  onUploadError,
  value,
  onRemove,
  className,
  variant = "dropzone",
  disabled = false,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const getFileUrlMutation = useMutation(api.files.getFileUrlMutation);
  
  // Value can be either a URL or a storage ID
  // If it's a Convex storage ID (starts with "k"), convert it to URL using query
  // Otherwise, assume it's already a URL
  const isStorageId = value?.startsWith("k") && value.length > 10;
  const storageId = isStorageId ? (value as Id<"_storage">) : undefined;
  const fileUrl = useQuery(
    api.files.getFileUrl,
    storageId ? { storageId } : "skip"
  );
  
  // Use query result if we have a storage ID, otherwise use value directly (assumed to be URL)
  // If query returns null, still try to use the value (might be a valid URL)
  const displayUrl = storageId 
    ? (fileUrl || (isStorageId ? undefined : value)) 
    : value;

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 4MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`;
    }

    // Check file type based on endpoint
    if (endpoint === "imageUploader") {
      if (!file.type.startsWith("image/")) {
        return "Please upload an image file";
      }
    } else if (endpoint === "fileUploader") {
      const allowedTypes = ["image/", "application/pdf"];
      if (!allowedTypes.some((type) => file.type.startsWith(type))) {
        return "Please upload an image or PDF file";
      }
    }

    return null;
  };

  const handleFileSelect = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      onUploadError?.(new Error(validationError));
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Get upload URL from Convex
      const uploadUrl = await generateUploadUrl();

      // Upload file to Convex storage
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error(`Upload failed: ${result.statusText}`);
      }

      const { storageId } = await result.json();

      // Try to get the file URL using Convex storage API
      // Note: getUrl can return null if the file isn't immediately available
      let fileUrl: string | null = null;
      try {
        fileUrl = await getFileUrlMutation({ storageId });
      } catch (error) {
        console.warn("[FileUpload] Failed to get file URL immediately:", error);
      }

      // If we got a URL, use it. Otherwise, pass the storageId and let the query handle it
      if (fileUrl) {
        onUploadComplete?.(fileUrl);
      } else {
        // Pass storageId as a fallback - the component will use the query to get the URL
        onUploadComplete?.(storageId);
      }
    } catch (error) {
      console.error("[FileUpload] Upload error:", error);
      onUploadError?.(error instanceof Error ? error : new Error("Upload failed"));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  // Show uploaded file preview
  if (displayUrl || (storageId && !fileUrl)) {
    // Show loading state if we have a storageId but no URL yet
    if (storageId && !fileUrl) {
      return (
        <div className={cn("relative group", className)}>
          <div className="border-2 border-border rounded-lg p-4 bg-muted/30">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Loading file...</p>
                <p className="text-xs text-muted-foreground truncate mt-1">
                  {storageId}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className={cn("relative group", className)}>
        <div className="border-2 border-border rounded-lg p-4 bg-muted/30">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {displayUrl ? displayUrl.split("/").pop() || "Uploaded file" : "Uploaded file"}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-1">
                {displayUrl || storageId || "No URL available"}
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
          {endpoint === "imageUploader" && displayUrl && (
            <div className="mt-4">
              <img
                src={displayUrl}
                alt="Uploaded"
                className="max-w-full max-h-48 rounded-lg object-contain"
                onError={(e) => {
                  // Image failed to load
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Disabled state
  if (disabled) {
    return (
      <div
        className={cn(
          "mt-2 flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 text-center",
          "bg-muted/30 cursor-not-allowed opacity-50",
          className
        )}
      >
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

  // Button variant
  if (variant === "button") {
    return (
      <div className={className}>
        <input
          ref={fileInputRef}
          type="file"
          accept={endpoint === "imageUploader" ? "image/*" : "image/*,.pdf"}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || isUploading}
        />
        <Button
          type="button"
          onClick={handleClick}
          disabled={disabled || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Upload className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Choose File
            </>
          )}
        </Button>
        {isUploading && uploadProgress > 0 && (
          <div className="mt-2 w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>
    );
  }

  // Dropzone variant (default)
  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={endpoint === "imageUploader" ? "image/*" : "image/*,.pdf"}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={cn(
          "mt-2 flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 text-center cursor-pointer transition-colors",
          "hover:border-primary hover:bg-muted/50",
          isUploading && "opacity-50 cursor-not-allowed",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        {isUploading ? (
          <>
            <Upload className="h-8 w-8 text-muted-foreground animate-spin mb-2" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
            {uploadProgress > 0 && (
              <div className="mt-2 w-full max-w-xs bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </>
        ) : (
          <>
            {endpoint === "imageUploader" ? (
              <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            )}
            <p className="text-sm text-muted-foreground">
              Choose a file or drag and drop
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {endpoint === "imageUploader"
                ? "Images (max 4MB)"
                : "Images and PDFs (max 4MB)"}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

