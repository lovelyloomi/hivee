import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface HexagonAvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "h-10 w-10",
  md: "h-16 w-16",
  lg: "h-24 w-24",
  xl: "h-32 w-32",
};

export const HexagonAvatar = ({ 
  src, 
  alt = "Avatar", 
  fallback = "U",
  className,
  size = "md"
}: HexagonAvatarProps) => {
  return (
    <div 
      className={cn("relative", sizeClasses[size], className)}
      style={{
        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
      <div className="absolute inset-[2px]" style={{
        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
      }}>
        <Avatar className="w-full h-full border-0 rounded-none">
          <AvatarImage src={src || undefined} alt={alt} className="object-cover" />
          <AvatarFallback className="bg-gradient-to-br from-primary/10 to-accent/10 text-foreground rounded-none">
            {fallback}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};
