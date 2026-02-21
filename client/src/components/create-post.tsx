import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Image as ImageIcon, Smile, Loader2, X } from "lucide-react";
import { GifPicker } from "@/components/gif-picker";
import { useNostr } from "@/contexts/nostr-context";
import { useState, useRef } from "react";

interface CreatePostProps {
  placeholder?: string;
  onPost?: (content: string, image?: string) => void;
}

export function CreatePost({ placeholder = "Share something with the community...", onPost }: CreatePostProps) {
  const { profile, isConnected } = useNostr();
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePost = async () => {
    if (!content.trim() && !image) return;
    if (!onPost) return;
    setIsPosting(true);
    try {
      await onPost(content.trim(), image || undefined);
      setContent("");
      setImage(null);
      setShowGifPicker(false);
    } finally {
      setIsPosting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGifSelect = (gifUrl: string) => {
    setImage(gifUrl);
    setShowGifPicker(false);
  };

  if (!isConnected) {
    return null;
  }
  
  return (
    <Card className="border-none shadow-sm bg-card mb-6">
      <CardContent className="p-4 flex gap-4">
        <Avatar className="w-10 h-10 border border-border">
          <AvatarImage src={profile?.picture} />
          <AvatarFallback>{profile?.name?.[0] || "?"}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-[#F5F5F5] rounded-sm px-4 py-2.5 text-base focus:outline-none transition-all font-serif placeholder:text-muted-foreground resize-none min-h-[80px]"
            rows={3}
            data-testid="input-post-content"
          />
          
          {image && (
            <div className="relative mt-3 inline-block">
              <img src={image} alt="Preview" className="max-h-48 rounded-lg" />
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2 w-6 h-6"
                onClick={() => setImage(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {showGifPicker && (
            <div className="mt-3">
              <GifPicker
                onSelect={handleGifSelect}
                onClose={() => setShowGifPicker(false)}
              />
            </div>
          )}
          
          <div className="flex items-center justify-between mt-3 px-1">
            <div className="flex items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,image/gif"
                className="hidden"
                onChange={handleImageUpload}
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-[#6600ff] hover:bg-[#F0E6FF] rounded-full"
                onClick={() => fileInputRef.current?.click()}
                data-testid="button-add-image"
              >
                <ImageIcon className="w-4 h-4" strokeWidth={1.5} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`rounded-full ${showGifPicker ? 'text-[#6600ff] bg-[#F0E6FF]' : 'text-muted-foreground hover:text-[#6600ff] hover:bg-[#F0E6FF]'}`}
                onClick={() => setShowGifPicker(!showGifPicker)}
                data-testid="button-add-gif"
              >
                <Smile className="w-4 h-4" strokeWidth={1.5} />
              </Button>
            </div>
            <Button 
              className="rounded-full px-6 font-normal" 
              onClick={handlePost}
              disabled={(!content.trim() && !image) || isPosting}
              data-testid="button-post"
            >
              {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
