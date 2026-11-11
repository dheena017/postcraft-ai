'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { ParsedSheetRow } from '@/types/job';
import { Calendar, Hash, ExternalLink } from 'lucide-react';

interface SheetDataPreviewTableProps {
  rows: ParsedSheetRow[];
}

export const SheetDataPreviewTable: React.FC<SheetDataPreviewTableProps> = ({ rows }) => {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">
            Detected Prompts &amp; Schedule Preview ({rows.length} rows)
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Review the extracted prompts and scheduled times before queuing them for generation.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[460px] overflow-y-auto scrollbar-thin">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-zinc-950/95 backdrop-blur-md text-zinc-400 border-b border-zinc-800 z-10">
            <tr>
              <th className="py-2.5 px-3 font-semibold w-12">#</th>
              <th className="py-2.5 px-3 font-semibold min-w-[220px]">Image Prompt</th>
              <th className="py-2.5 px-3 font-semibold min-w-[150px]">Title</th>
              <th className="py-2.5 px-3 font-semibold min-w-[120px]">Board</th>
              <th className="py-2.5 px-3 font-semibold min-w-[150px]">Schedule Date/Time</th>
              <th className="py-2.5 px-3 font-semibold w-24">Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-zinc-800/30 transition-colors">
                <td className="py-2.5 px-3 text-zinc-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Hash className="w-3 h-3 text-zinc-600" />
                    {row.rowIndex}
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <p className="font-medium text-zinc-100 line-clamp-2">{row.prompt}</p>
                </td>
                <td className="py-2.5 px-3 text-zinc-300">
                  <p className="line-clamp-1">{row.title}</p>
                </td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex px-2 py-0.5 rounded-md bg-zinc-800 text-[11px] text-zinc-300 border border-zinc-700/60">
                    {row.board}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-zinc-400">
                  <span className="flex items-center gap-1.5 whitespace-nowrap">
                    <Calendar className="w-3 h-3 text-brand-400" />
                    {new Date(row.scheduleTime).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-zinc-500">
                  {row.link ? (
                    <a
                      href={row.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-brand-400 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>URL</span>
                    </a>
                  ) : (
                    <span className="text-zinc-600">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
