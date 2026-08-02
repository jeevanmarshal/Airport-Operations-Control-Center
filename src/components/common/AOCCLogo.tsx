import React from 'react';

export default function AOCCLogo({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className={className}
      fill="none"
      aria-label="Airport Operations Control Center Logo"
    >
      {/* Outer Radar Ring */}
      <circle cx="256" cy="256" r="230" stroke="#00D4FF" strokeWidth="16" strokeDasharray="4 16" opacity="0.6" />
      {/* Inner Ring */}
      <circle cx="256" cy="256" r="180" stroke="#00D4FF" strokeWidth="4" opacity="0.3" />
      {/* Crosshairs */}
      <path d="M256 26 L256 486 M26 256 L486 256" stroke="#00D4FF" strokeWidth="4" opacity="0.3" />

      {/* Control Tower Geometry */}
      <path d="M226 400 L240 260 L272 260 L286 400 Z" fill="#0A0F1E" stroke="#00D4FF" strokeWidth="12" strokeLinejoin="round" />
      {/* Tower Cab */}
      <path d="M216 260 L296 260 L310 200 L202 200 Z" fill="#00D4FF" />
      {/* Tower Antenna */}
      <path d="M256 200 L256 160" stroke="#00FF88" strokeWidth="8" strokeLinecap="round" />
      <circle cx="256" cy="150" r="8" fill="#FF3366" />

      {/* Flight Path Arc */}
      <path
        d="M120 360 C 80 200, 200 120, 380 140"
        fill="none"
        stroke="#00FF88"
        strokeWidth="12"
        strokeDasharray="16 12"
        strokeLinecap="round"
      />

      {/* Aircraft */}
      <g transform="translate(380, 140) rotate(15) scale(0.6)">
        <path
          d="M0 -40 L12 -15 L50 -5 L50 5 L12 15 L5 40 L15 45 L-15 45 L-5 40 L-12 15 L-50 5 L-50 -5 L-12 -15 Z"
          fill="#00D4FF"
        />
      </g>
    </svg>
  );
}
