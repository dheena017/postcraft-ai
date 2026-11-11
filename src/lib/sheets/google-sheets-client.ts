import { parseCsvText } from './csv-parser';
import { SheetMappingConfig } from '@/types/job';

// Extracts spreadsheet ID and optional GID from Google Sheets URL
export function parseGoogleSheetUrl(url: string): { sheetId: string; gid: string } | null {
  try {
    const trimmed = url.trim();
    // Match /spreadsheets/d/{ID}
    const idMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!idMatch || !idMatch[1]) {
      return null;
    }

    const sheetId = idMatch[1];
    
    // Match gid={GID}
    const gidMatch = trimmed.match(/[?&#]gid=([0-9]+)/);
    const gid = gidMatch && gidMatch[1] ? gidMatch[1] : '0';

    return { sheetId, gid };
  } catch {
    return null;
  }
}

// Converts a Google Sheet URL into a direct CSV export endpoint
export function getGoogleSheetCsvExportUrl(url: string): string | null {
  const parsed = parseGoogleSheetUrl(url);
  if (!parsed) return null;
  return `https://docs.google.com/spreadsheets/d/${parsed.sheetId}/export?format=csv&gid=${parsed.gid}`;
}

// Fetches public Google Sheet data as parsed rows
export async function fetchGoogleSheetData(sheetUrl: string, customMapping?: Partial<SheetMappingConfig>) {
  const exportUrl = getGoogleSheetCsvExportUrl(sheetUrl);
  if (!exportUrl) {
    throw new Error('Invalid Google Spreadsheet URL. Please ensure it follows the format: https://docs.google.com/spreadsheets/d/{ID}/edit');
  }

  const response = await fetch(exportUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Spreadsheet not found. Please verify the link.');
    }
    if (response.status === 401 || response.status === 403 || response.redirected) {
      throw new Error('Access denied. Please ensure the Google Sheet permissions are set to "Anyone with the link can view".');
    }
    throw new Error(`Failed to download spreadsheet data (HTTP ${response.status})`);
  }

  const csvText = await response.text();
  return parseCsvText(csvText, customMapping);
}
