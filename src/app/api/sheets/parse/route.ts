import { NextRequest, NextResponse } from 'next/server';
import { fetchGoogleSheetData } from '@/lib/sheets/google-sheets-client';
import { parseCsvText } from '@/lib/sheets/csv-parser';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sheetUrl, csvContent, mapping } = body;

    if (sheetUrl) {
      const data = await fetchGoogleSheetData(sheetUrl, mapping);
      return NextResponse.json(data);
    }

    if (csvContent) {
      const data = parseCsvText(csvContent, mapping);
      return NextResponse.json(data);
    }

    return NextResponse.json(
      { error: 'Please provide either a valid Google Sheet URL or raw CSV content.' },
      { status: 400 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to parse sheet data';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
