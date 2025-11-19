import notificationIcon from "@/assets/notification-icon.png";
import translateIcon from "@/assets/translate-icon.png";
import sunIcon from "@/assets/sun-icon.png";
import moonIcon from "@/assets/moon-icon.png";

interface IconProps {
  className?: string;
}

export const BellIcon = ({ className }: IconProps) => (
  <img 
    src={notificationIcon} 
    alt="Notifications" 
    className={className}
    style={{ width: '20px', height: '20px' }}
  />
);

export const GlobeIcon = ({ className }: IconProps) => (
  <img 
    src={translateIcon} 
    alt="Language" 
    className={className}
    style={{ width: '20px', height: '20px' }}
  />
);

export const SunIcon = ({ className }: IconProps) => (
  <img 
    src={sunIcon} 
    alt="Light mode" 
    className={className}
    style={{ width: '20px', height: '20px' }}
  />
);

export const MoonIcon = ({ className }: IconProps) => (
  <img 
    src={moonIcon} 
    alt="Dark mode" 
    className={className}
    style={{ width: '20px', height: '20px' }}
  />
);
