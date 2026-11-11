'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { SheetMappingConfig } from '@/types/job';
import { Settings2 } from 'lucide-react';

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
    { key: 'promptCol', label: 'Image Prompt Column', required: true },
    { key: 'titleCol', label: 'Pin Title Column', required: true },
    { key: 'descriptionCol', label: 'Pin Description Column' },
    { key: 'boardCol', label: 'Target Board Column' },
    { key: 'linkCol', label: 'Destination URL Column' },
    { key: 'scheduleTimeCol', label: 'Scheduled Time Column' },
  ];

  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
        <Settings2 className="w-4 h-4 text-brand-400" />
        <h3 className="text-sm font-semibold text-zinc-200">Spreadsheet Column Mapping</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {fields.map(({ key, label, required }) => (
          <div key={key} className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 flex items-center gap-1">
              {label}
              {required && <span className="text-rose-400">*</span>}
            </label>
            <select
              value={mapping[key] || ''}
              onChange={(e) => handleChange(key, e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-brand-500 focus:outline-none"
            >
              <option value="">-- None / Default --</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </Card>
  );
};
