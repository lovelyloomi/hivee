import headerIcons from "@/assets/header-icons.png";

interface IconProps {
  className?: string;
}

export const BellIcon = ({ className }: IconProps) => (
  <div 
    className={className}
    style={{
      width: '20px',
      height: '20px',
      backgroundImage: `url(${headerIcons})`,
      backgroundPosition: '0 0',
      backgroundSize: '80px 20px',
      backgroundRepeat: 'no-repeat'
    }}
  />
);

export const GlobeIcon = ({ className }: IconProps) => (
  <div 
    className={className}
    style={{
      width: '20px',
      height: '20px',
      backgroundImage: `url(${headerIcons})`,
      backgroundPosition: '-20px 0',
      backgroundSize: '80px 20px',
      backgroundRepeat: 'no-repeat'
    }}
  />
);

export const SunIcon = ({ className }: IconProps) => (
  <div 
    className={className}
    style={{
      width: '20px',
      height: '20px',
      backgroundImage: `url(${headerIcons})`,
      backgroundPosition: '-40px 0',
      backgroundSize: '80px 20px',
      backgroundRepeat: 'no-repeat'
    }}
  />
);

export const MoonIcon = ({ className }: IconProps) => (
  <div 
    className={className}
    style={{
      width: '20px',
      height: '20px',
      backgroundImage: `url(${headerIcons})`,
      backgroundPosition: '-60px 0',
      backgroundSize: '80px 20px',
      backgroundRepeat: 'no-repeat'
    }}
  />
);
