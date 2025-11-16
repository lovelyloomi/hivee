import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

type AccountType = 'freelance_artist' | 'commission_artist' | 'art_student' | 'studio_agency' | 'gallery_curator' | 'art_collector';

interface AccountTypeBadgeProps {
  accountType: AccountType | null;
  className?: string;
}

const accountTypeColors: Record<AccountType, string> = {
  freelance_artist: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  commission_artist: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
  art_student: "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20",
  studio_agency: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  gallery_curator: "bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/20",
  art_collector: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
};

const AccountTypeBadge = ({ accountType, className }: AccountTypeBadgeProps) => {
  const { t } = useLanguage();

  if (!accountType) return null;

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium",
        accountTypeColors[accountType],
        className
      )}
    >
      {t(`accountType.${accountType}.title`)}
    </Badge>
  );
};

export default AccountTypeBadge;
