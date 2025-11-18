import { cn } from "@/lib/utils";

interface HexagonImageProps {
  src: string;
  alt?: string;
  className?: string;
  onClick?: () => void;
}

export const HexagonImage = ({ 
  src, 
  alt = "Image", 
  className,
  onClick
}: HexagonImageProps) => {
  return (
    <div 
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 transition-transform hover:scale-105",
        onClick && "cursor-pointer",
        className
      )}
      style={{
        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
      }}
      onClick={onClick}
    >
      <img 
        src={src} 
        alt={alt} 
        className="w-full h-full object-cover"
      />
    </div>
  );
};
