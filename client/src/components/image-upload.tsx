import { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
  aspectRatio?: "video" | "square";
}

export function ImageUpload({ value, onChange, className, aspectRatio = "video" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await res.json();
      onChange(data.url);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const handleRemove = useCallback(() => {
    onChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [onChange]);

  if (value) {
    return (
      <div className={cn("relative group", className)}>
        <div className={cn(
          "relative overflow-hidden rounded-lg border border-gray-200",
          aspectRatio === "video" ? "aspect-video" : "aspect-square"
        )}>
          <img
            src={value}
            alt="Thumbnail preview"
            className="w-full h-full object-cover"
            data-testid="img-thumbnail-preview"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-white text-foreground border-white"
                onClick={() => fileInputRef.current?.click()}
                data-testid="button-change-image"
              >
                <Upload className="w-4 h-4 mr-1" />
                Change
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-white text-destructive border-white"
                onClick={handleRemove}
                data-testid="button-remove-image"
              >
                <X className="w-4 h-4 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed cursor-pointer transition-colors",
          aspectRatio === "video" ? "aspect-video" : "aspect-square",
          isDragging
            ? "border-[#6600ff] bg-[#F0E6FF]"
            : "border-gray-300 bg-white hover:border-gray-400 hover:bg-[#FAFAFA]",
          isUploading && "pointer-events-none opacity-60"
        )}
        data-testid="dropzone-image-upload"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-[#F5F5F5] flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Drag and drop an image, or <span className="text-[#6600ff]">browse</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPEG, PNG, GIF, WebP (max 5MB)
              </p>
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="text-xs text-destructive mt-1" data-testid="text-upload-error">{error}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}
