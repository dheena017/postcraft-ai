import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', glow = false, ...props }) => {
  return (
    <div
      className={`rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xl p-5 md:p-6 transition-all duration-200 ${
        glow ? 'shadow-xl shadow-brand-500/5 border-brand-500/20' : 'shadow-md shadow-black/20'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
