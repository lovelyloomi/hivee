import { NavLink } from "@/components/NavLink";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { Badge } from "@/components/ui/badge";
import beefindIcon from "@/assets/beefind-icon.png";
import beemadeIcon from "@/assets/beemade-icon.png";
import beefriendIcon from "@/assets/beefriend-icon.png";
import beesinesIcon from "@/assets/beesiness-icon.png";
import hiveeLogo from "@/assets/hivee-logo.png";

const BottomNav = () => {
  const { t } = useLanguage();
  const unreadCount = useUnreadMessages();

  return <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border">
      <div className="honeycomb-bg absolute inset-0 opacity-50" />
      <div className="container mx-auto px-2 relative z-10">
        <div className="flex items-center justify-around py-2">
          <NavLink to="/find" className="flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors text-muted-foreground" activeClassName="text-primary bg-primary/10">
            <img src={beefindIcon} alt="BEEFIND" className="h-12 w-12" />
            <span className="text-[10px] font-medium">{t('nav.find')}</span>
          </NavLink>

          <NavLink to="/matches" className="flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors text-muted-foreground relative" activeClassName="text-primary bg-primary/10">
            <img src={beefriendIcon} alt="BEEhunt" className="h-12 w-12" />
            <span className="text-[10px] font-medium">{t('nav.connections')}</span>
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-1 text-xs"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </NavLink>

          <NavLink to="/" className="flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors text-muted-foreground" activeClassName="text-primary bg-primary/10">
            <img src={hiveeLogo} alt="Home" className="h-14 w-14" />
          </NavLink>

          <NavLink to="/works" className="flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors text-muted-foreground" activeClassName="text-primary bg-primary/10">
            <img src={beemadeIcon} alt="BEEmade" className="h-12 w-12" />
            <span className="text-[10px] font-medium">{t('nav.gallery')}</span>
          </NavLink>

          <NavLink to="/opportunities" className="flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors text-muted-foreground" activeClassName="text-primary bg-primary/10">
            <img src={beesinesIcon} alt="BEEsiness" className="h-12 w-12" />
            <span className="text-[10px] font-medium">{t('nav.opportunities')}</span>
          </NavLink>
        </div>
      </div>
    </nav>;
};

export default BottomNav;