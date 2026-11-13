'use client';

import React from 'react';
import { ScheduledJob } from '@/types/job';
import { Badge } from '../ui/Badge';
import { Calendar, Trash2, ExternalLink, Image as ImageIcon } from 'lucide-react';

interface QueueJobRowProps {
  job: ScheduledJob;
  onDelete: (id: string) => void;
}

export const QueueJobRow: React.FC<QueueJobRowProps> = ({ job, onDelete }) => {
  return (
    <tr className="hover:bg-zinc-800/40 transition-colors">
      {/* Thumbnail or Placeholder */}
      <td className="py-3 px-4 w-16">
        <div className="w-12 h-16 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center flex-shrink-0">
          {job.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={job.imageUrl} alt={job.title} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-5 h-5 text-zinc-600" />
          )}
        </div>
      </td>

      {/* Title & Prompt Details */}
      <td className="py-3 px-4">
        <div>
          <h4 className="font-semibold text-sm text-zinc-100 line-clamp-1">{job.title}</h4>
          <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5">{job.prompt}</p>
          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-zinc-500">
            <span>Model: <strong className="text-zinc-300 font-mono">{job.model || 'flux'}</strong></span>
            <span>•</span>
            <span>Ratio: {job.aspectRatio}</span>
            <span>•</span>
            <span>Board: {job.boardName}</span>
            {job.destinationUrl && (
              <>
                <span>•</span>
                <a
                  href={job.destinationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-400 hover:underline flex items-center gap-0.5"
                >
                  Link <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </>
            )}
          </div>
        </div>
      </td>

      {/* Target Provider */}
      <td className="py-3 px-4 whitespace-nowrap">
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20">
          📌 {job.providerId}
        </span>
      </td>

      {/* Scheduled Time */}
      <td className="py-3 px-4 whitespace-nowrap text-zinc-300 text-xs">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
          <span>
            {new Date(job.scheduledFor).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </td>

      {/* Status Badge */}
      <td className="py-3 px-4 whitespace-nowrap">
        <Badge status={job.status} />
        {job.errorMessage && (
          <p className="text-[10px] text-red-400 mt-1 max-w-[150px] truncate" title={job.errorMessage}>
            {job.errorMessage}
          </p>
        )}
      </td>

      {/* Actions */}
      <td className="py-3 px-4 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-2">
          {job.externalPostUrl && (
            <a
              href={job.externalPostUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg text-brand-400 hover:text-brand-300 hover:bg-zinc-800 transition-colors"
              title="View on Pinterest"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <button
            onClick={() => onDelete(job.id)}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
            title="Delete from Queue"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};
