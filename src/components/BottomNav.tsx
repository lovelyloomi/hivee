import { NavLink } from "@/components/NavLink";
import { useLanguage } from "@/contexts/LanguageContext";
import beefindIcon from "@/assets/beefind-icon.png";
import beemadeIcon from "@/assets/beemade-icon.png";
import beefriendIcon from "@/assets/beefriend-icon.png";
import beesinesIcon from "@/assets/beesiness-icon.png";
import hiveeLogo from "@/assets/hivee-logo.png";

const BottomNav = () => {
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border honeycomb-bg">
      <div className="container mx-auto px-2">
        <div className="flex items-center justify-around py-0.5">
          <NavLink
            to="/find"
            className="flex flex-col items-center gap-0.5 px-2 py-0.5 rounded-lg transition-colors text-muted-foreground"
            activeClassName="text-primary bg-primary/10"
          >
            <img src={beefindIcon} alt="BEEFIND" className="h-16 w-16" />
            <span className="text-xs font-medium">{t('nav.find')}</span>
          </NavLink>

          <NavLink
            to="/matches"
            className="flex flex-col items-center gap-0.5 px-2 py-0.5 rounded-lg transition-colors text-muted-foreground"
            activeClassName="text-primary bg-primary/10"
          >
            <img src={beefriendIcon} alt="BEEhunt" className="h-16 w-16" />
            <span className="text-xs font-medium">{t('nav.connections')}</span>
          </NavLink>

          <NavLink
            to="/"
            className="flex flex-col items-center gap-0.5 px-2 py-0.5 rounded-lg transition-colors text-muted-foreground"
            activeClassName="text-primary bg-primary/10"
          >
            <img src={hiveeLogo} alt="Home" className="h-20 w-20" />
            <span className="text-xs font-medium">{t('nav.home')}</span>
          </NavLink>

          <NavLink
            to="/works"
            className="flex flex-col items-center gap-0.5 px-2 py-0.5 rounded-lg transition-colors text-muted-foreground"
            activeClassName="text-primary bg-primary/10"
          >
            <img src={beemadeIcon} alt="BEEmade" className="h-16 w-16" />
            <span className="text-xs font-medium">{t('nav.gallery')}</span>
          </NavLink>

          <NavLink
            to="/opportunities"
            className="flex flex-col items-center gap-0.5 px-2 py-0.5 rounded-lg transition-colors text-muted-foreground"
            activeClassName="text-primary bg-primary/10"
          >
            <img src={beesinesIcon} alt="BEEsiness" className="h-16 w-16" />
            <span className="text-xs font-medium">{t('nav.opportunities')}</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
