import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { SunIcon, MoonIcon } from "@/components/CustomHeaderIcons";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative"
    >
      <div className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0">
        <SunIcon />
      </div>
      <div className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100">
        <MoonIcon />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};
