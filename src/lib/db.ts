import { getSqliteDb } from './sqlite';
import { ScheduledJob } from '@/types/job';
import { ImageGenerationResult, AspectRatio, StylePresetId } from '@/types/image';

interface DatabaseSettings {
  pinterest: {
    accessToken?: string;
    refreshToken?: string;
    clientId?: string;
    clientSecret?: string;
    defaultBoardId?: string;
    connectedAccountName?: string;
  };
  scheduler: {
    autoRunEnabled: boolean;
    pollIntervalSeconds: number;
  };
}

const DEFAULT_SETTINGS: DatabaseSettings = {
  pinterest: {
    connectedAccountName: undefined,
  },
  scheduler: {
    autoRunEnabled: true,
    pollIntervalSeconds: 60,
  },
};

interface SqliteJobRow {
  id: string;
  source: string;
  prompt: string;
  title: string;
  description: string | null;
  boardName: string;
  destinationUrl: string | null;
  aspectRatio: string;
  stylePreset: string | null;
  providerId: string;
  scheduledFor: string;
  status: string;
  externalPostId: string | null;
  externalPostUrl: string | null;
  generatedImageUrl: string | null;
  error: string | null;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

function rowToJob(row: SqliteJobRow): ScheduledJob {
  return {
    id: row.id,
    source: row.source as ScheduledJob['source'],
    prompt: row.prompt,
    title: row.title,
    description: row.description || '',
    boardName: row.boardName,
    destinationUrl: row.destinationUrl || undefined,
    aspectRatio: (row.aspectRatio || '2:3') as AspectRatio,
    stylePreset: (row.stylePreset || undefined) as StylePresetId | undefined,
    providerId: row.providerId,
    scheduledFor: row.scheduledFor,
    status: row.status as ScheduledJob['status'],
    imageUrl: row.generatedImageUrl || undefined,
    externalPostId: row.externalPostId || undefined,
    externalPostUrl: row.externalPostUrl || undefined,
    errorMessage: row.error || undefined,
    retryCount: row.retryCount,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// ==========================================
// 1. JOBS SQL OPERATIONS
// ==========================================

export async function getAllJobs(): Promise<ScheduledJob[]> {
  const db = getSqliteDb();
  const rows = db.prepare('SELECT * FROM jobs ORDER BY scheduledFor ASC').all() as unknown as SqliteJobRow[];
  return rows.map(rowToJob);
}

export async function getJobById(id: string): Promise<ScheduledJob | undefined> {
  const db = getSqliteDb();
  const row = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id) as unknown as SqliteJobRow | undefined;
  return row ? rowToJob(row) : undefined;
}

export async function createJob(job: Omit<ScheduledJob, 'id' | 'createdAt' | 'updatedAt' | 'retryCount'>): Promise<ScheduledJob> {
  const db = getSqliteDb();
  const now = new Date().toISOString();
  const id = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const stmt = db.prepare(`
    INSERT INTO jobs (
      id, source, prompt, title, description, boardName, destinationUrl,
      aspectRatio, stylePreset, providerId, scheduledFor, status,
      generatedImageUrl, externalPostId, externalPostUrl, error, retryCount, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
  `);

  stmt.run(
    id,
    job.source || 'MANUAL',
    job.prompt,
    job.title,
    job.description || '',
    job.boardName || 'General Ideas',
    job.destinationUrl || null,
    job.aspectRatio || '2:3',
    job.stylePreset || null,
    job.providerId || 'pinterest',
    job.scheduledFor,
    job.status || 'PENDING',
    job.imageUrl || null,
    job.externalPostId || null,
    job.externalPostUrl || null,
    job.errorMessage || null,
    now,
    now
  );

  return (await getJobById(id))!;
}

export async function createBulkJobs(jobs: Array<Omit<ScheduledJob, 'id' | 'createdAt' | 'updatedAt' | 'retryCount'>>): Promise<ScheduledJob[]> {
  const db = getSqliteDb();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO jobs (
      id, source, prompt, title, description, boardName, destinationUrl,
      aspectRatio, stylePreset, providerId, scheduledFor, status,
      generatedImageUrl, externalPostId, externalPostUrl, error, retryCount, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
  `);

  const created: ScheduledJob[] = [];

  db.exec('BEGIN TRANSACTION;');
  try {
    jobs.forEach((job, idx) => {
      const id = `job_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`;
      stmt.run(
        id,
        job.source || 'GOOGLE_SHEETS',
        job.prompt,
        job.title,
        job.description || '',
        job.boardName || 'General Ideas',
        job.destinationUrl || null,
        job.aspectRatio || '2:3',
        job.stylePreset || null,
        job.providerId || 'pinterest',
        job.scheduledFor,
        job.status || 'PENDING',
        job.imageUrl || null,
        job.externalPostId || null,
        job.externalPostUrl || null,
        job.errorMessage || null,
        now,
        now
      );
      created.push({
        ...job,
        id,
        retryCount: 0,
        createdAt: now,
        updatedAt: now,
      });
    });
    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }

  return created;
}

export async function updateJob(id: string, updates: Partial<ScheduledJob>): Promise<ScheduledJob | null> {
  const db = getSqliteDb();
  const existing = await getJobById(id);
  if (!existing) return null;

  const merged = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const stmt = db.prepare(`
    UPDATE jobs SET
      source = ?, prompt = ?, title = ?, description = ?, boardName = ?,
      destinationUrl = ?, aspectRatio = ?, stylePreset = ?, providerId = ?,
      scheduledFor = ?, status = ?, generatedImageUrl = ?, externalPostId = ?,
      externalPostUrl = ?, error = ?, retryCount = ?, updatedAt = ?
    WHERE id = ?
  `);

  stmt.run(
    merged.source,
    merged.prompt,
    merged.title,
    merged.description,
    merged.boardName,
    merged.destinationUrl || null,
    merged.aspectRatio,
    merged.stylePreset || null,
    merged.providerId,
    merged.scheduledFor,
    merged.status,
    merged.imageUrl || null,
    merged.externalPostId || null,
    merged.externalPostUrl || null,
    merged.errorMessage || null,
    merged.retryCount,
    merged.updatedAt,
    id
  );

  return (await getJobById(id)) || null;
}

export async function deleteJob(id: string): Promise<boolean> {
  const db = getSqliteDb();
  const info = db.prepare('DELETE FROM jobs WHERE id = ?').run(id);
  return info.changes > 0;
}

// ==========================================
// 2. GALLERY SQL OPERATIONS
// ==========================================

interface SqliteGalleryRow {
  id: string;
  imageUrl: string;
  prompt: string;
  enhancedPrompt: string | null;
  width: number;
  height: number;
  aspectRatio: string;
  seed: number;
  createdAt: string;
}

export async function getGallery(): Promise<ImageGenerationResult[]> {
  const db = getSqliteDb();
  const rows = db.prepare('SELECT * FROM gallery ORDER BY createdAt DESC LIMIT 100').all() as unknown as SqliteGalleryRow[];
  return rows.map((r) => ({
    imageUrl: r.imageUrl,
    prompt: r.prompt,
    enhancedPrompt: r.enhancedPrompt || r.prompt,
    width: r.width,
    height: r.height,
    aspectRatio: r.aspectRatio as AspectRatio,
    seed: r.seed,
    createdAt: r.createdAt,
  }));
}

export async function addToGallery(item: ImageGenerationResult): Promise<void> {
  const db = getSqliteDb();
  const id = `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const stmt = db.prepare(`
    INSERT INTO gallery (id, imageUrl, prompt, enhancedPrompt, width, height, aspectRatio, seed, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    item.imageUrl,
    item.prompt,
    item.enhancedPrompt || null,
    item.width,
    item.height,
    item.aspectRatio,
    item.seed,
    item.createdAt || new Date().toISOString()
  );
}

// ==========================================
// 3. SETTINGS SQL OPERATIONS
// ==========================================

export async function getSettings(): Promise<DatabaseSettings> {
  const db = getSqliteDb();
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('app_settings') as unknown as { value: string } | undefined;
  if (!row) return DEFAULT_SETTINGS;
  try {
    return JSON.parse(row.value);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function updateSettings(updates: Partial<DatabaseSettings>): Promise<DatabaseSettings> {
  const db = getSqliteDb();
  const current = await getSettings();
  const merged: DatabaseSettings = {
    ...current,
    ...updates,
    pinterest: {
      ...current.pinterest,
      ...(updates.pinterest || {}),
    },
    scheduler: {
      ...current.scheduler,
      ...(updates.scheduler || {}),
    },
  };

  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO settings (key, value, updatedAt)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = excluded.updatedAt
  `).run('app_settings', JSON.stringify(merged), now);

  return merged;
}
