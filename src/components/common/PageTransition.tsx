import React, { ReactNode } from 'react';

export default function PageTransition({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`animate-fade-in w-full h-full ${className}`}>
      {children}
    </div>
  );
}
