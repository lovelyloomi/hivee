import { Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface VerificationBadgeProps {
  isVerified: boolean;
  size?: "sm" | "md";
  className?: string;
}

const VerificationBadge = ({ isVerified, size = "sm", className }: VerificationBadgeProps) => {
  const { t } = useLanguage();
  
  if (!isVerified) return null;

  const sizeClasses = {
    sm: "w-5 h-5 text-xs",
    md: "w-7 h-7 text-sm"
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "inline-flex items-center justify-center rounded-full bg-primary/10 border-2 border-primary",
              sizeClasses[size],
              className
            )}
          >
            <Check className="w-3 h-3 text-primary" strokeWidth={3} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('verification.emailVerified')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VerificationBadge;
