import React from 'react';
import { Card } from '../ui/Card';
import { ScheduledJob } from '@/types/job';
import { Clock, CheckCircle2, AlertCircle, Layers } from 'lucide-react';

interface QueueStatsSummaryProps {
  jobs: ScheduledJob[];
}

export const QueueStatsSummary: React.FC<QueueStatsSummaryProps> = ({ jobs }) => {
  const total = jobs.length;
  const pending = jobs.filter((j) => j.status === 'PENDING' || j.status === 'READY').length;
  const published = jobs.filter((j) => j.status === 'PUBLISHED').length;
  const failed = jobs.filter((j) => j.status === 'FAILED').length;

  const stats = [
    {
      label: 'Total Queue Tasks',
      value: total,
      icon: Layers,
      color: 'text-zinc-300',
      bg: 'bg-zinc-800/60',
    },
    {
      label: 'Pending / Scheduled',
      value: pending,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Published Pins',
      value: published,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Failed / Retrying',
      value: failed,
      icon: AlertCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <Card key={i} className="flex items-center gap-4 p-4">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-zinc-400 font-medium">{stat.label}</p>
              <p className="text-xl sm:text-2xl font-bold text-white mt-0.5">{stat.value}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
