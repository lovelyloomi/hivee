import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface HashtagInputProps {
  value: string;
  onChange: (value: string) => void;
  maxTags?: number;
}

export const HashtagInput = ({ value, onChange, maxTags = 5 }: HashtagInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize tags from comma-separated value
  useEffect(() => {
    const initialTags = value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    setTags(initialTags);
  }, []);

  // Update parent whenever tags change
  useEffect(() => {
    onChange(tags.join(', '));
  }, [tags, onChange]);

  const addTag = (tag: string) => {
    const cleanTag = tag.trim().toLowerCase().replace(/^#+/, '');
    if (cleanTag && !tags.includes(cleanTag) && tags.length < maxTags) {
      const newTags = [...tags, cleanTag];
      setTags(newTags);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Don't allow spaces in the middle of a tag
    if (newValue.includes(' ')) {
      if (inputValue.trim()) {
        addTag(inputValue);
      }
      return;
    }
    setInputValue(newValue);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-border rounded-md bg-background">
        {tags.map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="gap-1 pr-1 hover:bg-secondary/80"
          >
            <span>#{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 rounded-full hover:bg-background/50 p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {tags.length < maxTags && (
          <div className="flex items-center flex-1 min-w-[120px]">
            <span className="text-muted-foreground">#</span>
            <Input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={tags.length === 0 ? "Type hashtag and press space..." : ""}
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0 pl-1"
            />
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {tags.length}/{maxTags} hashtags • Press space or enter to add • Max {maxTags} hashtags
      </p>
    </div>
  );
};
