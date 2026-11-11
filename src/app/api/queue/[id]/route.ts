import { NextRequest, NextResponse } from 'next/server';
import { getJobById, updateJob, deleteJob } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const job = await getJobById(params.id);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    return NextResponse.json(job);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching job';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const updated = await updateJob(params.id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error updating job';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await deleteJob(params.id);
    if (!deleted) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, id: params.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error deleting job';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
