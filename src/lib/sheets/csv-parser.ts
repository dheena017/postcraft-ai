import Papa from 'papaparse';
import { ParsedSheetRow, SheetMappingConfig } from '@/types/job';

// Intelligently infer column names from CSV headers
export function detectColumnMapping(headers: string[]): SheetMappingConfig {
  const findMatch = (candidates: string[]): string => {
    for (const c of candidates) {
      const match = headers.find((h) => h.toLowerCase().trim().includes(c.toLowerCase()));
      if (match) return match;
    }
    return '';
  };

  return {
    promptCol: findMatch(['prompt', 'image_prompt', 'ai_prompt', 'idea', 'content']) || headers[0] || '',
    titleCol: findMatch(['title', 'pin_title', 'headline', 'subject']) || headers[1] || '',
    descriptionCol: findMatch(['description', 'pin_description', 'caption', 'details']) || headers[2] || '',
    boardCol: findMatch(['board', 'pinterest_board', 'category', 'topic']) || '',
    linkCol: findMatch(['link', 'url', 'destination', 'website', 'dest_url']) || '',
    scheduleTimeCol: findMatch(['time', 'date', 'schedule', 'scheduled_for', 'publish_at', 'post_at']) || '',
    statusCol: findMatch(['status', 'state']) || '',
  };
}

export function parseCsvText(csvText: string, customMapping?: Partial<SheetMappingConfig>): {
  headers: string[];
  mapping: SheetMappingConfig;
  rows: ParsedSheetRow[];
  rawRows: Record<string, string>[];
} {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  const headers = result.meta.fields || [];
  const detectedMapping = detectColumnMapping(headers);
  const mapping: SheetMappingConfig = {
    ...detectedMapping,
    ...customMapping,
  };

  const rows: ParsedSheetRow[] = [];

  result.data.forEach((row, index) => {
    const prompt = (row[mapping.promptCol] || '').trim();
    if (!prompt) return; // skip rows without a prompt

    const title = (row[mapping.titleCol] || '').trim() || prompt.substring(0, 60);
    const description = (row[mapping.descriptionCol] || '').trim() || prompt;
    const board = (row[mapping.boardCol] || '').trim() || 'General Ideas';
    const link = (row[mapping.linkCol] || '').trim();
    
    // Normalize schedule time: if empty or invalid, default to now + (index * 1 hour)
    let scheduleTime = (row[mapping.scheduleTimeCol] || '').trim();
    if (!scheduleTime || isNaN(new Date(scheduleTime).getTime())) {
      const future = new Date();
      future.setMinutes(future.getMinutes() + (index + 1) * 30);
      scheduleTime = future.toISOString();
    } else {
      scheduleTime = new Date(scheduleTime).toISOString();
    }

    const status = (row[mapping.statusCol || ''] || '').trim();

    rows.push({
      rowIndex: index + 1,
      prompt,
      title,
      description,
      board,
      link,
      scheduleTime,
      status,
      raw: row,
    });
  });

  return {
    headers,
    mapping,
    rows,
    rawRows: result.data,
  };
}
