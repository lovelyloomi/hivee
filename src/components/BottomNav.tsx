import { NavLink } from "@/components/NavLink";
import { Compass, Image, Heart, Briefcase, Home } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const BottomNav = () => {
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around py-3">
          <NavLink
            to="/find"
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors text-muted-foreground"
            activeClassName="text-primary bg-primary/10"
          >
            <Heart className="h-6 w-6" />
            <span className="text-xs font-medium">{t('nav.swipe')}</span>
          </NavLink>

          <NavLink
            to="/works"
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors text-muted-foreground"
            activeClassName="text-primary bg-primary/10"
          >
            <Image className="h-6 w-6" />
            <span className="text-xs font-medium">{t('nav.gallery')}</span>
          </NavLink>

          <NavLink
            to="/"
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors text-muted-foreground"
            activeClassName="text-primary bg-primary/10"
          >
            <Home className="h-7 w-7" />
            <span className="text-xs font-medium">{t('nav.home')}</span>
          </NavLink>

          <NavLink
            to="/matches"
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors text-muted-foreground"
            activeClassName="text-primary bg-primary/10"
          >
            <Heart className="h-6 w-6 fill-current" />
            <span className="text-xs font-medium">{t('nav.connections')}</span>
          </NavLink>

          <NavLink
            to="/opportunities"
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors text-muted-foreground"
            activeClassName="text-primary bg-primary/10"
          >
            <Briefcase className="h-6 w-6" />
            <span className="text-xs font-medium">{t('nav.opportunities')}</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
