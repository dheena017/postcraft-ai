'use client';

import React from 'react';
import { SheetMappingConfig } from '@/types/job';
import { Settings2, ChevronDown } from 'lucide-react';

interface ColumnMappingFormProps {
  headers: string[];
  mapping: SheetMappingConfig;
  onChange: (updated: SheetMappingConfig) => void;
}

export const ColumnMappingForm: React.FC<ColumnMappingFormProps> = ({
  headers,
  mapping,
  onChange,
}) => {
  const handleChange = (field: keyof SheetMappingConfig, value: string) => {
    onChange({
      ...mapping,
      [field]: value,
    });
  };

  const fields: Array<{ key: keyof SheetMappingConfig; label: string; required?: boolean }> = [
    { key: 'promptCol', label: 'Image Prompt', required: true },
    { key: 'titleCol', label: 'Pin Title', required: true },
    { key: 'boardCol', label: 'Target Board' },
    { key: 'scheduleTimeCol', label: 'Scheduled Time' },
    { key: 'descriptionCol', label: 'Pin Description' },
    { key: 'linkCol', label: 'Destination URL' },
  ];

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3 space-y-2.5">
      <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/80">
        <div className="flex items-center gap-1.5">
          <Settings2 className="w-3.5 h-3.5 text-brand-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
            Column Mapping
          </h3>
        </div>
        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-brand-500/10 text-brand-400 border border-brand-500/25">
          Auto-Mapped
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {fields.map(({ key, label, required }) => (
          <div key={key} className="space-y-1">
            <label className="text-[10px] font-semibold text-zinc-400 flex items-center justify-between">
              <span className="truncate">{label}</span>
              {required && <span className="text-rose-400 font-bold ml-0.5">*</span>}
            </label>
            <div className="relative">
              <select
                value={mapping[key] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full appearance-none rounded-lg border border-zinc-700/80 bg-zinc-950 px-2.5 py-1.5 pr-6 text-xs text-zinc-100 font-medium focus:border-brand-500 focus:outline-none cursor-pointer"
              >
                <option value="">-- None / Default --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-zinc-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
