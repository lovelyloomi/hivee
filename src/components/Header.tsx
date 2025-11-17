import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Search } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
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

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const languages = [
    { code: "en" as const, name: "English", flag: "🇬🇧" },
    { code: "fr" as const, name: "Français", flag: "🇫🇷" },
    { code: "it" as const, name: "Italiano", flag: "🇮🇹" },
    { code: "es" as const, name: "Español", flag: "🇪🇸" },
    { code: "zh" as const, name: "中文", flag: "🇨🇳" },
    { code: "ja" as const, name: "日本語", flag: "🇯🇵" },
    { code: "ar" as const, name: "العربية", flag: "🇵🇸" },
  ];

  // Get context for search
  const getSearchContext = () => {
    if (location.pathname === '/opportunities') return 'opportunities';
    if (location.pathname === '/works') return 'works';
    if (location.pathname.startsWith('/profile')) return 'users';
    return 'all';
  };

  const searchContext = getSearchContext();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}&context=${searchContext}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <div
          className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent cursor-pointer whitespace-nowrap"
          onClick={() => navigate("/")}
        >
          {t('header.title')}
        </div>

        {/* Desktop search bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <Input
              type="text"
              placeholder={
                searchContext === 'opportunities' ? 'Search opportunities...' :
                searchContext === 'works' ? 'Search works...' :
                searchContext === 'users' ? 'Search users...' :
                t('header.searchPlaceholder')
              }
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
              }}
              onFocus={() => setShowSuggestions(searchQuery.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="pl-9 pr-4"
            />
            {showSuggestions && searchQuery && (
              <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="p-2">
                  <div className="text-xs text-muted-foreground px-2 py-1">
                    Searching in: <span className="font-semibold text-foreground capitalize">{searchContext === 'all' ? 'Everything' : searchContext}</span>
                  </div>
                  <button
                    type="submit"
                    className="w-full text-left px-3 py-2 hover:bg-muted rounded-md transition-colors flex items-center gap-2"
                    onClick={handleSearch}
                  >
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Search for "<span className="font-semibold">{searchQuery}</span>"</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>

        <div className="flex items-center gap-2">
          {/* Mobile search button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/search")}
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
                <Heart className="h-5 w-5" />
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
    </header>
  );
};

export default Header;
