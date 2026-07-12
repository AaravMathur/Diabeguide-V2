import React from "react";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
  glow?: boolean;
}

export function Logo({ className = "w-8 h-8", size, glow = true, ...props }: LogoProps) {
  const inlineSize = size ? { width: size, height: size } : {};

  return (
    <svg 
      className={`${className} transition-all duration-300`} 
      style={{
        ...inlineSize,
        filter: glow ? "drop-shadow(0 0 4px rgba(6, 182, 212, 0.15))" : "none"
      }}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient id="db-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="50%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      
      {/* Outer stylized 'D' curve */}
      <path 
        d="M7 3.5H12C16.6944 3.5 20.5 7.30558 20.5 12C20.5 16.6944 16.6944 20.5 12 20.5H7C6.44772 20.5 6 20.0523 6 19.5V4.5C6 3.94772 6.44772 3.5 7 3.5Z" 
        stroke="url(#db-logo-grad)" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Inner heartbeat ECG pulse line */}
      <path 
        d="M4 12H8L10 7.5L12.5 16.5L15 10.5L16.5 12.5L20 12.5" 
        stroke="url(#db-logo-grad)" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
}
