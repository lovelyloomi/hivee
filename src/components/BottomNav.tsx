import { NavLink } from "@/components/NavLink";
import { Search, Image, Heart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const BottomNav = () => {
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around py-3">
          <NavLink
            to="/find"
            className="flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors text-muted-foreground"
            activeClassName="text-primary bg-primary/10"
          >
            <Search className="h-6 w-6" />
            <span className="text-xs font-medium">{t('nav.find')}</span>
          </NavLink>

          <NavLink
            to="/works"
            className="flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors text-muted-foreground"
            activeClassName="text-primary bg-primary/10"
          >
            <Image className="h-6 w-6" />
            <span className="text-xs font-medium">{t('nav.works')}</span>
          </NavLink>

          <NavLink
            to="/matches"
            className="flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors text-muted-foreground"
            activeClassName="text-primary bg-primary/10"
          >
            <Heart className="h-6 w-6" />
            <span className="text-xs font-medium">{t('nav.matches')}</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
