import { AspectRatio, StylePresetId, AiModelId } from './image';

export type JobStatus = 'PENDING' | 'GENERATING' | 'READY' | 'PUBLISHING' | 'PUBLISHED' | 'FAILED' | 'CANCELLED';

export interface ScheduledJob {
  id: string;
  source: 'MANUAL' | 'GOOGLE_SHEETS' | 'CSV_UPLOAD';
  prompt: string;
  title: string;
  description: string;
  boardName: string;
  destinationUrl?: string;
  aspectRatio: AspectRatio;
  stylePreset?: StylePresetId;
  model?: AiModelId;
  providerId: string; // 'pinterest' | 'instagram' | etc.
  scheduledFor: string; // ISO date string
  status: JobStatus;
  imageUrl?: string;
  enhancedPrompt?: string;
  externalPostId?: string;
  externalPostUrl?: string;
  errorMessage?: string;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SheetMappingConfig {
  promptCol: string;
  titleCol: string;
  descriptionCol: string;
  boardCol: string;
  linkCol: string;
  scheduleTimeCol: string;
  statusCol?: string;
}

export interface ParsedSheetRow {
  rowIndex: number;
  prompt: string;
  title: string;
  description: string;
  board: string;
  link?: string;
  scheduleTime: string;
  status?: string;
  raw: Record<string, string>;
}
