'use client';

import React from 'react';
import { SheetMappingConfig } from '@/types/job';
import { Settings2 } from 'lucide-react';
import { Select } from '@/components/ui/Select';

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

  const columnOptions = [
    { value: '', label: '-- None / Default --' },
    ...headers.map((h) => ({ value: h, label: h })),
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

      <div className="grid grid-cols-2 gap-2.5">
        {fields.map(({ key, label, required }) => (
          <div key={key}>
            <Select
              label={label}
              required={required}
              value={mapping[key] || ''}
              onChange={(val) => handleChange(key, val)}
              options={columnOptions}
              placeholder="-- Select Column --"
              size="sm"
              searchable={headers.length > 5}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
