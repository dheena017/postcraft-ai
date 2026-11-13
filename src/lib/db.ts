import { getSqliteDb } from './sqlite';
import { ScheduledJob } from '@/types/job';
import { ImageGenerationResult, AspectRatio, StylePresetId } from '@/types/image';
import { AppNotification, NotificationType } from '@/types/notification';

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
  model: string | null;
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
    model: (row.model || 'flux') as ScheduledJob['model'],
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
      aspectRatio, stylePreset, model, providerId, scheduledFor, status,
      generatedImageUrl, externalPostId, externalPostUrl, error, retryCount, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
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
    job.model || 'flux',
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
      aspectRatio, stylePreset, model, providerId, scheduledFor, status,
      generatedImageUrl, externalPostId, externalPostUrl, error, retryCount, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
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
        job.model || 'flux',
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
      destinationUrl = ?, aspectRatio = ?, stylePreset = ?, model = ?, providerId = ?,
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
    merged.model || 'flux',
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
  model: string | null;
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
    model: (r.model || 'flux') as ImageGenerationResult['model'],
    createdAt: r.createdAt,
  }));
}

export async function addToGallery(item: ImageGenerationResult): Promise<void> {
  const db = getSqliteDb();
  const id = `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const stmt = db.prepare(`
    INSERT INTO gallery (id, imageUrl, prompt, enhancedPrompt, width, height, aspectRatio, seed, model, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    item.model || 'flux',
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

// ==========================================
// 4. NOTIFICATIONS SQL OPERATIONS
// ==========================================

interface SqliteNotificationRow {
  id: string;
  type: string;
  title: string;
  message: string;
  read: number;
  link: string | null;
  createdAt: string;
}

function rowToNotification(row: SqliteNotificationRow): AppNotification {
  return {
    id: row.id,
    type: row.type as NotificationType,
    title: row.title,
    message: row.message,
    read: row.read === 1,
    link: row.link || undefined,
    createdAt: row.createdAt,
  };
}

export async function getAllNotifications(): Promise<AppNotification[]> {
  const db = getSqliteDb();

  // Check if we need to seed initial welcome notifications
  const countRow = db.prepare('SELECT COUNT(*) as count FROM notifications').get() as { count: number };
  if (countRow.count === 0) {
    const now = new Date();
    const seedNotifications = [
      {
        id: `notif_${Date.now()}_1`,
        type: 'SYSTEM',
        title: 'Welcome to PostCraft AI',
        message: 'Your automated AI Pinterest creator and queue manager is up and running.',
        read: 0,
        link: '/studio',
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        id: `notif_${Date.now()}_2`,
        type: 'PIN',
        title: 'Pinterest Integration Active',
        message: 'Pinterest API OAuth credentials are configured and ready for automated publishing.',
        read: 0,
        link: '/dashboard',
        createdAt: new Date(now.getTime() - 1000 * 60 * 45).toISOString(),
      },
      {
        id: `notif_${Date.now()}_3`,
        type: 'STUDIO',
        title: 'AI Studio Engine Ready',
        message: 'Free high-res image generation with Gemini AI prompt enhancer is online.',
        read: 0,
        link: '/studio',
        createdAt: new Date(now.getTime() - 1000 * 60 * 20).toISOString(),
      },
      {
        id: `notif_${Date.now()}_4`,
        type: 'QUEUE',
        title: 'Scheduler Queue Service Online',
        message: 'Background scheduler is monitoring scheduled pins for automated publishing.',
        read: 1,
        link: '/queue',
        createdAt: new Date(now.getTime() - 1000 * 60 * 10).toISOString(),
      },
    ];

    const insertStmt = db.prepare(`
      INSERT INTO notifications (id, type, title, message, read, link, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    db.exec('BEGIN TRANSACTION;');
    try {
      for (const item of seedNotifications) {
        insertStmt.run(item.id, item.type, item.title, item.message, item.read, item.link, item.createdAt);
      }
      db.exec('COMMIT;');
    } catch {
      db.exec('ROLLBACK;');
    }
  }

  const rows = db
    .prepare('SELECT * FROM notifications ORDER BY createdAt DESC LIMIT 150')
    .all() as unknown as SqliteNotificationRow[];

  return rows.map(rowToNotification);
}

export async function createNotification(data: {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}): Promise<AppNotification> {
  const db = getSqliteDb();
  const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO notifications (id, type, title, message, read, link, createdAt)
    VALUES (?, ?, ?, ?, 0, ?, ?)
  `);

  stmt.run(id, data.type, data.title, data.message, data.link || null, now);

  return {
    id,
    type: data.type,
    title: data.title,
    message: data.message,
    read: false,
    link: data.link,
    createdAt: now,
  };
}

export async function markNotificationRead(id: string, read: boolean = true): Promise<boolean> {
  const db = getSqliteDb();
  const info = db.prepare('UPDATE notifications SET read = ? WHERE id = ?').run(read ? 1 : 0, id);
  return info.changes > 0;
}

export async function markAllNotificationsRead(): Promise<number> {
  const db = getSqliteDb();
  const info = db.prepare('UPDATE notifications SET read = 1 WHERE read = 0').run();
  return info.changes;
}

export async function deleteNotification(id: string): Promise<boolean> {
  const db = getSqliteDb();
  const info = db.prepare('DELETE FROM notifications WHERE id = ?').run(id);
  return info.changes > 0;
}

export async function clearAllNotifications(): Promise<number> {
  const db = getSqliteDb();
  const info = db.prepare('DELETE FROM notifications').run();
  return info.changes;
}

