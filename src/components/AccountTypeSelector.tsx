import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { Briefcase, Palette, GraduationCap, Building2, Eye, Heart } from "lucide-react";

type AccountType = 'freelance_artist' | 'commission_artist' | 'art_student' | 'studio_agency' | 'gallery_curator' | 'art_collector';

interface AccountTypeSelectorProps {
  selectedType: AccountType | null;
  onSelect: (type: AccountType) => void;
}

const accountTypes: { type: AccountType; icon: any }[] = [
  { type: 'freelance_artist', icon: Briefcase },
  { type: 'commission_artist', icon: Palette },
  { type: 'art_student', icon: GraduationCap },
  { type: 'studio_agency', icon: Building2 },
  { type: 'gallery_curator', icon: Eye },
  { type: 'art_collector', icon: Heart },
];

const AccountTypeSelector = ({ selectedType, onSelect }: AccountTypeSelectorProps) => {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {accountTypes.map(({ type, icon: Icon }) => (
        <Card
          key={type}
          className={cn(
            "p-6 cursor-pointer transition-all hover:shadow-lg border-2",
            selectedType === type
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          )}
          onClick={() => onSelect(type)}
        >
          <div className="flex flex-col items-center text-center gap-3">
            <div className={cn(
              "p-4 rounded-full",
              selectedType === type ? "bg-primary text-primary-foreground" : "bg-muted"
            )}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                {t(`accountType.${type}.title`)}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t(`accountType.${type}.description`)}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AccountTypeSelector;
