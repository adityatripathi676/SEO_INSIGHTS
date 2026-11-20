// lib/db.ts
// Storage abstraction bridge — replaces SQLite with high-reliability local JSON storage
import { getStorage, ScrapingJob, JobStatus } from "./storage";

export type { JobStatus, ScrapingJob };

export async function createJob(id: string, originalPrompt: string): Promise<ScrapingJob> {
  return getStorage().createJob(id, originalPrompt);
}

export async function getJobById(id: string): Promise<ScrapingJob | null> {
  return getStorage().getJobById(id);
}

export async function getJobBySnapshotId(snapshotId: string): Promise<ScrapingJob | null> {
  return getStorage().getJobBySnapshotId(snapshotId);
}

export async function getAllJobs(): Promise<ScrapingJob[]> {
  return getStorage().getAllJobs();
}

export async function updateJobSnapshotId(id: string, snapshotId: string): Promise<void> {
  return getStorage().updateJobSnapshotId(id, snapshotId);
}

export async function updateJobStage(id: string, stage: string, status?: JobStatus): Promise<void> {
  return getStorage().updateJobStage(id, stage, status);
}

export async function saveRawResults(id: string, results: unknown[]): Promise<void> {
  return getStorage().saveRawResults(id, results);
}

export async function saveAnalysisPrompt(id: string, prompt: string): Promise<void> {
  return getStorage().saveAnalysisPrompt(id, prompt);
}

export async function saveSeoReport(id: string, report: unknown): Promise<void> {
  return getStorage().saveSeoReport(id, report);
}

export async function completeJob(id: string): Promise<void> {
  return getStorage().completeJob(id);
}

export async function failJob(id: string, error: string): Promise<void> {
  return getStorage().failJob(id, error);
}

export async function retryJob(id: string): Promise<void> {
  return getStorage().retryJob(id);
}

export async function deleteJob(id: string): Promise<void> {
  return getStorage().deleteJob(id);
}

export async function deleteAllJobs(excludeDemo: boolean = true): Promise<void> {
  return getStorage().deleteAllJobs(excludeDemo);
}

export async function enforceJobLimit(limit: number = 5, excludeDemo: boolean = true): Promise<void> {
  return getStorage().enforceJobLimit(limit, excludeDemo);
}

export async function findCachedJobByPrompt(
  prompt: string,
  ttlMs: number = 48 * 60 * 60 * 1000
): Promise<ScrapingJob | null> {
  return getStorage().findCachedJobByPrompt(prompt, ttlMs);
}

export async function createJobFromCache(
  id: string,
  prompt: string,
  cachedJob: ScrapingJob
): Promise<ScrapingJob> {
  return getStorage().createJobFromCache(id, prompt, cachedJob);
}
