import React from 'react';
import { JobStatus } from '@/types/job';

interface BadgeProps {
  status?: JobStatus | 'ACTIVE' | 'CONNECTED' | 'DISCONNECTED';
  label?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, label, className = '' }) => {
  const displayLabel = label || status;

  const getStyle = () => {
    switch (status) {
      case 'PUBLISHED':
      case 'CONNECTED':
      case 'ACTIVE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'PUBLISHING':
      case 'GENERATING':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30 animate-pulse';
      case 'READY':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'FAILED':
      case 'DISCONNECTED':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'CANCELLED':
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyle()} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {displayLabel}
    </span>
  );
};
