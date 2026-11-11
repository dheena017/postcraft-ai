import fs from 'fs/promises';
import path from 'path';
import { ScheduledJob } from '@/types/job';
import { ImageGenerationResult } from '@/types/image';

interface DatabaseSchema {
  jobs: ScheduledJob[];
  gallery: ImageGenerationResult[];
  settings: {
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
  };
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const INITIAL_DB: DatabaseSchema = {
  jobs: [],
  gallery: [],
  settings: {
    pinterest: {
      connectedAccountName: undefined,
    },
    scheduler: {
      autoRunEnabled: true,
      pollIntervalSeconds: 60,
    },
  },
};

// Ensure directory and db file exist
async function ensureDb(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(DB_FILE);
    } catch {
      await fs.writeFile(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), 'utf-8');
    }
  } catch (error) {
    console.error('Error ensuring db:', error);
  }
}

export async function readDb(): Promise<DatabaseSchema> {
  await ensureDb();
  try {
    const raw = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return INITIAL_DB;
  }
}

export async function writeDb(data: DatabaseSchema): Promise<void> {
  await ensureDb();
  const tempFile = `${DB_FILE}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(data, null, 2), 'utf-8');
  await fs.rename(tempFile, DB_FILE);
}

// Job helpers
export async function getAllJobs(): Promise<ScheduledJob[]> {
  const db = await readDb();
  return db.jobs.sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());
}

export async function getJobById(id: string): Promise<ScheduledJob | undefined> {
  const db = await readDb();
  return db.jobs.find((j) => j.id === id);
}

export async function createJob(job: Omit<ScheduledJob, 'id' | 'createdAt' | 'updatedAt' | 'retryCount'>): Promise<ScheduledJob> {
  const db = await readDb();
  const now = new Date().toISOString();
  const newJob: ScheduledJob = {
    ...job,
    id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    retryCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  db.jobs.push(newJob);
  await writeDb(db);
  return newJob;
}

export async function createBulkJobs(jobs: Array<Omit<ScheduledJob, 'id' | 'createdAt' | 'updatedAt' | 'retryCount'>>): Promise<ScheduledJob[]> {
  const db = await readDb();
  const now = new Date().toISOString();
  const created: ScheduledJob[] = jobs.map((j, idx) => ({
    ...j,
    id: `job_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
    retryCount: 0,
    createdAt: now,
    updatedAt: now,
  }));
  db.jobs.push(...created);
  await writeDb(db);
  return created;
}

export async function updateJob(id: string, updates: Partial<ScheduledJob>): Promise<ScheduledJob | null> {
  const db = await readDb();
  const index = db.jobs.findIndex((j) => j.id === id);
  if (index === -1) return null;

  db.jobs[index] = {
    ...db.jobs[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await writeDb(db);
  return db.jobs[index];
}

export async function deleteJob(id: string): Promise<boolean> {
  const db = await readDb();
  const initialLength = db.jobs.length;
  db.jobs = db.jobs.filter((j) => j.id !== id);
  if (db.jobs.length !== initialLength) {
    await writeDb(db);
    return true;
  }
  return false;
}

// Gallery helpers
export async function getGallery(): Promise<ImageGenerationResult[]> {
  const db = await readDb();
  return db.gallery.slice().reverse();
}

export async function addToGallery(item: ImageGenerationResult): Promise<void> {
  const db = await readDb();
  // Keep last 100 images
  db.gallery.push(item);
  if (db.gallery.length > 100) {
    db.gallery = db.gallery.slice(-100);
  }
  await writeDb(db);
}

// Settings helpers
export async function getSettings() {
  const db = await readDb();
  return db.settings;
}

export async function updateSettings(updates: Partial<DatabaseSchema['settings']>) {
  const db = await readDb();
  db.settings = {
    ...db.settings,
    ...updates,
  };
  await writeDb(db);
  return db.settings;
}
