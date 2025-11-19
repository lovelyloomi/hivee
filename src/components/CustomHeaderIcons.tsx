import { Bell, Globe, Sun, Moon } from "lucide-react";

interface IconProps {
  className?: string;
}

export const BellIcon = ({ className }: IconProps) => (
  <Bell className={className} />
);

export const GlobeIcon = ({ className }: IconProps) => (
  <Globe className={className} />
);

export const SunIcon = ({ className }: IconProps) => (
  <Sun className={className} />
);

export const MoonIcon = ({ className }: IconProps) => (
  <Moon className={className} />
);
