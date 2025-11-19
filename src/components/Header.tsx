import hiveeLogo from "@/assets/hivee-logo.png";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GlobeIcon } from "@/components/CustomHeaderIcons";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { NotificationCenter } from "@/components/NotificationCenter";
import UserMenu from "@/components/UserMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SearchModal } from "@/components/SearchModal";

const Header = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const languages = [
    { code: "en" as const, name: "English", flag: "🇬🇧" },
    { code: "fr" as const, name: "Français", flag: "🇫🇷" },
    { code: "it" as const, name: "Italiano", flag: "🇮🇹" },
    { code: "es" as const, name: "Español", flag: "🇪🇸" },
    { code: "zh" as const, name: "中文", flag: "🇨🇳" },
    { code: "ja" as const, name: "日本語", flag: "🇯🇵" },
    { code: "ar" as const, name: "العربية", flag: "🇵🇸" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-1 flex items-center justify-between gap-4">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src={hiveeLogo} alt="HIVEE" className="h-20 w-auto" />
        </div>

        {/* Desktop search bar */}
        <div 
          className="flex-1 max-w-md hidden sm:block cursor-pointer"
          onClick={() => setSearchModalOpen(true)}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <div className="h-10 pl-9 pr-4 flex items-center bg-muted/50 rounded-md text-muted-foreground text-sm">
              {t('header.searchPlaceholder')}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile search button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchModalOpen(true)}
            className="rounded-full sm:hidden"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Notification Center */}
          <NotificationCenter />
          
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <GlobeIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border z-50">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className="cursor-pointer hover:bg-muted"
                >
                  <span className="mr-2">{lang.flag}</span>
                  {lang.name}
                  {language === lang.code && <span className="ml-auto text-primary">✓</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Dark Mode Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          <UserMenu />
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal open={searchModalOpen} onOpenChange={setSearchModalOpen} />
    </header>
  );
};

export default Header;
