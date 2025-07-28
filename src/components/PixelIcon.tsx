'use client';

interface PixelIconProps {
  name: string;
  size?: number | string;
  className?: string;
  color?: string;
}

export default function PixelIcon({ name, size = 28, className = '', color }: PixelIconProps) {

  const iconStyle = {
    fontSize: typeof size === 'number' ? `${size}px` : size,
    color: color,
    display: 'inline-block',
    lineHeight: 1,
    verticalAlign: '4px',
  };

  return (
    <i 
      className={`hn hn-${name} ${className}`}
      style={iconStyle}
      aria-hidden="true"
    />
  );
}

// Specific caution icon component for easy use
export function PixelCautionIcon({ size = 28, className = '', color = '#ffffff' }: Omit<PixelIconProps, 'name'>) {
  return (
    <PixelIcon 
      name="exclamation-triangle" 
      size={size} 
      className={className} 
      color={color}
    />
  );
}

// Helper component for common icons
export function PixelGitHubIcon({ size = 24, className = '', color }: Omit<PixelIconProps, 'name'>) {
  return <PixelIcon name="github" size={size} className={className} color={color} />;
}

export function PixelTwitterIcon({ size = 24, className = '', color }: Omit<PixelIconProps, 'name'>) {
  return <PixelIcon name="twitter" size={size} className={className} color={color} />;
}

export function PixelLinkedInIcon({ size = 24, className = '', color }: Omit<PixelIconProps, 'name'>) {
  return <PixelIcon name="linkedin" size={size} className={className} color={color} />;
}

export function PixelEmailIcon({ size = 24, className = '', color }: Omit<PixelIconProps, 'name'>) {
  return <PixelIcon name="email" size={size} className={className} color={color} />;
}

export function PixelHomeIcon({ size = 24, className = '', color }: Omit<PixelIconProps, 'name'>) {
  return <PixelIcon name="home" size={size} className={className} color={color} />;
}

export function PixelSearchIcon({ size = 24, className = '', color }: Omit<PixelIconProps, 'name'>) {
  return <PixelIcon name="search" size={size} className={className} color={color} />;
}

export function PixelSettingsIcon({ size = 24, className = '', color }: Omit<PixelIconProps, 'name'>) {
  return <PixelIcon name="settings" size={size} className={className} color={color} />;
}

export function PixelUserIcon({ size = 24, className = '', color }: Omit<PixelIconProps, 'name'>) {
  return <PixelIcon name="user" size={size} className={className} color={color} />;
}

export function PixelHeartIcon({ size = 24, className = '', color }: Omit<PixelIconProps, 'name'>) {
  return <PixelIcon name="heart" size={size} className={className} color={color} />;
}

// Custom cat face icon
export function PixelCatFaceIcon({ size = 24, className = '', color = '#ffffff' }: Omit<PixelIconProps, 'name'>) {
  const sizeNum = typeof size === 'number' ? size : parseInt(size.toString());
  
  return (
    <svg 
      width={sizeNum} 
      height={sizeNum} 
      viewBox="0 0 24 24" 
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cat ears */}
      <path d="M 4 4 L 4 10 L 7 7 Z" fill="none" stroke={color} strokeWidth="1"/>
      <path d="M 20 4 L 20 10 L 17 7 Z" fill="none" stroke={color} strokeWidth="1"/>

      {/* Cat head */}
      <rect x="4" y="7" width="16" height="12" fill="none" stroke={color} strokeWidth="1"/>

      {/* Eyes */}
      <rect x="7" y="10" width="2" height="2" fill={color}/>
      <rect x="15" y="10" width="2" height="2" fill={color}/>

      {/* Nose */}
      <rect x="11" y="13" width="2" height="1" fill={color}/>

      {/* Mouth */}
      <path d="M 12 14 L 10 16 M 12 14 L 14 16" fill="none" stroke={color} strokeWidth="1"/>

      {/* Whiskers */}
      <line x1="2" y1="11" x2="6" y2="11" stroke={color} strokeWidth="1"/>
      <line x1="2" y1="14" x2="6" y2="14" stroke={color} strokeWidth="1"/>
      <line x1="18" y1="11" x2="22" y2="11" stroke={color} strokeWidth="1"/>
      <line x1="18" y1="14" x2="22" y2="14" stroke={color} strokeWidth="1"/>
    </svg>
  );
}
