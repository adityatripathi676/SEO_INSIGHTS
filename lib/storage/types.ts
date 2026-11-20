// lib/storage/types.ts
// Standard storage contracts for SEO Tracker

export type JobStatus =
  | "pending"
  | "running"
  | "analyzing"
  | "completed"
  | "failed";

export interface ScrapingJob {
  id: string;
  original_prompt: string;
  analysis_prompt?: string;
  snapshot_id?: string;
  status: JobStatus;
  stage?: string;
  results?: unknown[];
  seo_report?: unknown;
  error?: string;
  created_at: number;
  completed_at?: number;
}

export interface StorageProvider {
  createJob(id: string, originalPrompt: string): Promise<ScrapingJob>;
  getJobById(id: string): Promise<ScrapingJob | null>;
  getJobBySnapshotId(snapshotId: string): Promise<ScrapingJob | null>;
  getAllJobs(): Promise<ScrapingJob[]>;
  updateJobSnapshotId(id: string, snapshotId: string): Promise<void>;
  updateJobStage(id: string, stage: string, status?: JobStatus): Promise<void>;
  saveRawResults(id: string, results: unknown[]): Promise<void>;
  saveAnalysisPrompt(id: string, prompt: string): Promise<void>;
  saveSeoReport(id: string, report: unknown): Promise<void>;
  completeJob(id: string): Promise<void>;
  failJob(id: string, error: string): Promise<void>;
  retryJob(id: string): Promise<void>;
  deleteJob(id: string): Promise<void>;
  deleteAllJobs(excludeDemo?: boolean): Promise<void>;
  enforceJobLimit(limit?: number, excludeDemo?: boolean): Promise<void>;
  findCachedJobByPrompt(prompt: string, ttlMs?: number): Promise<ScrapingJob | null>;
  createJobFromCache(id: string, prompt: string, cachedJob: ScrapingJob): Promise<ScrapingJob>;
  recoverInterruptedJobs(): Promise<number>;
}
