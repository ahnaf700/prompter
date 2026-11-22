import React from 'react';

interface SunburstEmblemProps {
  size?: number;
  className?: string;
}

export const SunburstEmblem: React.FC<SunburstEmblemProps> = ({
  size = 24,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    aria-hidden="true"
    className={`shrink-0 text-[#E06D3B] ${className}`}
  >
    <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <line x1="16" y1="3" x2="16" y2="11" />
      <line x1="16" y1="21" x2="16" y2="29" />
      <line x1="3" y1="16" x2="11" y2="16" />
      <line x1="21" y1="16" x2="29" y2="16" />
      <line x1="6.8" y1="6.8" x2="12.5" y2="12.5" />
      <line x1="19.5" y1="19.5" x2="25.2" y2="25.2" />
      <line x1="25.2" y1="6.8" x2="19.5" y2="12.5" />
      <line x1="12.5" y1="19.5" x2="6.8" y2="25.2" />
      <line x1="11" y1="4" x2="14" y2="11.5" />
      <line x1="18" y1="20.5" x2="21" y2="28" />
      <line x1="28" y1="11" x2="20.5" y2="14" />
      <line x1="11.5" y1="18" x2="4" y2="21" />
    </g>
  </svg>
);
