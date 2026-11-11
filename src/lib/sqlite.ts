import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = process.env.SQLITE_DB_PATH 
  ? path.resolve(process.cwd(), process.env.SQLITE_DB_PATH) 
  : path.join(DATA_DIR, 'postcraft.db');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let dbInstance: DatabaseSync | null = null;

export function getSqliteDb(): DatabaseSync {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_PATH);
    // Enable WAL mode for high concurrency and performance
    dbInstance.exec('PRAGMA journal_mode = WAL;');
    dbInstance.exec('PRAGMA foreign_keys = ON;');

    // Initialize clean tables (No hardcoded data)
    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        source TEXT NOT NULL DEFAULT 'MANUAL',
        prompt TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        boardName TEXT NOT NULL DEFAULT 'General Ideas',
        destinationUrl TEXT,
        aspectRatio TEXT NOT NULL DEFAULT '2:3',
        stylePreset TEXT NOT NULL DEFAULT 'aesthetic-minimal',
        providerId TEXT NOT NULL DEFAULT 'pinterest',
        scheduledFor TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'PENDING',
        publishedPostId TEXT,
        publishedPostUrl TEXT,
        generatedImageUrl TEXT,
        error TEXT,
        retryCount INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS gallery (
        id TEXT PRIMARY KEY,
        imageUrl TEXT NOT NULL,
        prompt TEXT NOT NULL,
        enhancedPrompt TEXT,
        width INTEGER NOT NULL,
        height INTEGER NOT NULL,
        aspectRatio TEXT NOT NULL,
        seed INTEGER NOT NULL,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);
  }
  return dbInstance;
}
