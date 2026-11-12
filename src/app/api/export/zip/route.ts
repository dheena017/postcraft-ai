import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { getAllJobs } from '@/lib/db';
import Papa from 'papaparse';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { jobIds } = body as { jobIds?: string[] };

    let jobs = await getAllJobs();
    if (jobIds && Array.isArray(jobIds) && jobIds.length > 0) {
      jobs = jobs.filter((j) => jobIds.includes(j.id));
    }

    // Only export jobs that have generated images
    const readyJobs = jobs.filter((j) => j.imageUrl);

    if (readyJobs.length === 0) {
      return NextResponse.json(
        { error: 'No generated images available for export.' },
        { status: 400 }
      );
    }

    const zip = new JSZip();
    const imagesFolder = zip.folder('pins');

    // Build Pinterest Bulk Upload CSV
    const csvRows = readyJobs.map((job, idx) => {
      const filename = `pin_${idx + 1}_${job.id.slice(-6)}.jpg`;
      return {
        'Title': job.title,
        'Media URL': job.imageUrl,
        'Pinterest board': job.boardName || 'General Ideas',
        'Description': job.description,
        'Link': job.destinationUrl || '',
        'Publish date': job.scheduledFor,
        'Local File': `pins/${filename}`,
      };
    });

    const csvContent = Papa.unparse(csvRows);
    zip.file('pinterest_bulk_upload.csv', csvContent);

    // Fetch and embed the images into the zip
    for (let i = 0; i < readyJobs.length; i++) {
      const job = readyJobs[i];
      const filename = `pin_${i + 1}_${job.id.slice(-6)}.jpg`;
      try {
        if (job.imageUrl) {
          if (job.imageUrl.startsWith('data:image')) {
            const base64Data = job.imageUrl.split(',')[1];
            const buffer = Buffer.from(base64Data, 'base64');
            imagesFolder?.file(filename, buffer);
          } else {
            const imgRes = await fetch(job.imageUrl);
            if (imgRes.ok) {
              const buffer = await imgRes.arrayBuffer();
              imagesFolder?.file(filename, buffer);
            }
          }
        }
      } catch (err) {
        logger.api.warn(`Could not download image for job ${job.id}:`, err);
      }
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    logger.api.success(`Exported ${readyJobs.length} pins and metadata to ZIP bundle (${Math.round(zipBuffer.length / 1024)} KB)`);

    return new Response(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="postcraft_pinterest_bundle_${Date.now()}.zip"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate export zip';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
