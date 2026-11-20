// lib/storage/json.ts
// Local-First JSON file storage implementation with atomic writes, path validation, and mutex locking
import fs from "fs";
import path from "path";
import { JobStatus, ScrapingJob, StorageProvider } from "./types";

const ID_REGEX = /^[a-zA-Z0-9_-]+$/;

export class JsonStorageProvider implements StorageProvider {
  private baseDir: string;
  private jobsDir: string;
  private reportsDir: string;
  private rawDir: string;
  private locks: Map<string, Promise<void>> = new Map();

  constructor(customPath?: string) {
    const configuredPath = customPath || process.env.LOCAL_STORAGE_PATH || "./data/local-storage";
    this.baseDir = path.resolve(process.cwd(), configuredPath);
    this.jobsDir = path.join(this.baseDir, "jobs");
    this.reportsDir = path.join(this.baseDir, "reports");
    this.rawDir = path.join(this.baseDir, "raw-results");

    this.ensureDirs();
  }

  private ensureDirs(): void {
    for (const dir of [this.baseDir, this.jobsDir, this.reportsDir, this.rawDir]) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  private validateId(id: string): void {
    if (!id || typeof id !== "string" || !ID_REGEX.test(id)) {
      throw new Error(`Invalid record ID: "${id}". Only alphanumeric characters, dashes and underscores are permitted.`);
    }
  }

  private getJobPath(id: string): string {
    this.validateId(id);
    const resolved = path.resolve(this.jobsDir, `${id}.json`);
    if (!resolved.startsWith(this.jobsDir)) {
      throw new Error("Access denied: path traversal attempt detected.");
    }
    return resolved;
  }

  private getReportPath(id: string): string {
    this.validateId(id);
    const resolved = path.resolve(this.reportsDir, `${id}.json`);
    if (!resolved.startsWith(this.reportsDir)) {
      throw new Error("Access denied: path traversal attempt detected.");
    }
    return resolved;
  }

  private getRawPath(id: string): string {
    this.validateId(id);
    const resolved = path.resolve(this.rawDir, `${id}.json`);
    if (!resolved.startsWith(this.rawDir)) {
      throw new Error("Access denied: path traversal attempt detected.");
    }
    return resolved;
  }

  /**
   * Acquire a per-key mutex lock to prevent concurrent write collisions on the same record
   */
  private async withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const prevLock = this.locks.get(key) || Promise.resolve();
    let release: () => void = () => {};
    const newLock = new Promise<void>((resolve) => {
      release = resolve;
    });
    this.locks.set(key, prevLock.then(() => newLock));

    try {
      await prevLock;
      return await fn();
    } finally {
      release();
      if (this.locks.get(key) === newLock) {
        this.locks.delete(key);
      }
    }
  }

  /**
   * Atomic file writing via temporary file and rename
   */
  private async atomicWriteJson(filePath: string, data: unknown): Promise<void> {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const tempFile = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`;
    const jsonString = JSON.stringify(data, null, 2);

    await fs.promises.writeFile(tempFile, jsonString, "utf-8");
    try {
      await fs.promises.rename(tempFile, filePath);
    } catch (err: unknown) {
      // Windows safety: if target exists and rename fails due to lock, fallback to copy + delete
      const error = err as NodeJS.ErrnoException;
      if (error?.code === "EPERM" || error?.code === "EBUSY") {
        await fs.promises.copyFile(tempFile, filePath);
        await fs.promises.unlink(tempFile).catch(() => {});
      } else {
        await fs.promises.unlink(tempFile).catch(() => {});
        throw err;
      }
    }
  }

  private async readJsonFile<T>(filePath: string): Promise<T | null> {
    try {
      if (!fs.existsSync(filePath)) return null;
      const raw = await fs.promises.readFile(filePath, "utf-8");
      return JSON.parse(raw) as T;
    } catch (err) {
      console.warn(`[JsonStorage] Error reading ${filePath}:`, err);
      return null;
    }
  }

  async createJob(id: string, originalPrompt: string): Promise<ScrapingJob> {
    this.validateId(id);
    return this.withLock(id, async () => {
      const job: ScrapingJob = {
        id,
        original_prompt: originalPrompt,
        status: "pending",
        created_at: Date.now(),
      };

      await this.atomicWriteJson(this.getJobPath(id), job);
      await this.enforceJobLimit(5);
      return job;
    });
  }

  async getJobById(id: string): Promise<ScrapingJob | null> {
    this.validateId(id);
    const jobPath = this.getJobPath(id);
    const job = await this.readJsonFile<ScrapingJob>(jobPath);
    if (!job) return null;

    // Attach SEO report if exists
    const reportPath = this.getReportPath(id);
    const report = await this.readJsonFile<unknown>(reportPath);
    if (report) {
      job.seo_report = report;
    }

    // Attach raw results if exists
    const rawPath = this.getRawPath(id);
    const raw = await this.readJsonFile<unknown[]>(rawPath);
    if (raw) {
      job.results = raw;
    }

    return job;
  }

  async getJobBySnapshotId(snapshotId: string): Promise<ScrapingJob | null> {
    const all = await this.getAllJobs();
    return all.find((j) => j.snapshot_id === snapshotId) || null;
  }

  async getAllJobs(): Promise<ScrapingJob[]> {
    this.ensureDirs();
    const files = await fs.promises.readdir(this.jobsDir);
    const jobs: ScrapingJob[] = [];

    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      const id = file.replace(/\.json$/, "");
      try {
        const job = await this.getJobById(id);
        if (job) {
          jobs.push(job);
        }
      } catch (err) {
        console.warn(`[JsonStorage] Failed to read job ${id}:`, err);
      }
    }

    // Order descending by created_at
    return jobs.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
  }

  async updateJobSnapshotId(id: string, snapshotId: string): Promise<void> {
    this.validateId(id);
    await this.withLock(id, async () => {
      const job = await this.readJsonFile<ScrapingJob>(this.getJobPath(id));
      if (!job) return;
      job.snapshot_id = snapshotId;
      job.status = "running";
      job.error = undefined;
      await this.atomicWriteJson(this.getJobPath(id), job);
    });
  }

  async updateJobStage(id: string, stage: string, status?: JobStatus): Promise<void> {
    this.validateId(id);
    await this.withLock(id, async () => {
      const job = await this.readJsonFile<ScrapingJob>(this.getJobPath(id));
      if (!job) return;
      job.stage = stage;
      if (status) job.status = status;
      await this.atomicWriteJson(this.getJobPath(id), job);
    });
  }

  async saveRawResults(id: string, results: unknown[]): Promise<void> {
    this.validateId(id);
    await this.withLock(id, async () => {
      await this.atomicWriteJson(this.getRawPath(id), results);

      const job = await this.readJsonFile<ScrapingJob>(this.getJobPath(id));
      if (job) {
        job.status = "analyzing";
        job.error = undefined;
        await this.atomicWriteJson(this.getJobPath(id), job);
      }
    });
  }

  async saveAnalysisPrompt(id: string, prompt: string): Promise<void> {
    this.validateId(id);
    await this.withLock(id, async () => {
      const job = await this.readJsonFile<ScrapingJob>(this.getJobPath(id));
      if (!job) return;
      job.analysis_prompt = prompt;
      await this.atomicWriteJson(this.getJobPath(id), job);
    });
  }

  async saveSeoReport(id: string, report: unknown): Promise<void> {
    this.validateId(id);
    await this.withLock(id, async () => {
      await this.atomicWriteJson(this.getReportPath(id), report);

      const job = await this.readJsonFile<ScrapingJob>(this.getJobPath(id));
      if (job) {
        job.error = undefined;
        await this.atomicWriteJson(this.getJobPath(id), job);
      }
    });
  }

  async completeJob(id: string): Promise<void> {
    this.validateId(id);
    await this.withLock(id, async () => {
      const job = await this.readJsonFile<ScrapingJob>(this.getJobPath(id));
      if (!job) return;
      job.status = "completed";
      job.completed_at = Date.now();
      job.error = undefined;
      await this.atomicWriteJson(this.getJobPath(id), job);
    });
  }

  async failJob(id: string, error: string): Promise<void> {
    this.validateId(id);
    await this.withLock(id, async () => {
      const job = await this.readJsonFile<ScrapingJob>(this.getJobPath(id));
      if (!job) return;
      job.status = "failed";
      job.error = error;
      job.completed_at = Date.now();
      await this.atomicWriteJson(this.getJobPath(id), job);
    });
  }

  async retryJob(id: string): Promise<void> {
    this.validateId(id);
    await this.withLock(id, async () => {
      const job = await this.readJsonFile<ScrapingJob>(this.getJobPath(id));
      if (!job) return;
      job.status = "pending";
      job.error = undefined;
      job.completed_at = undefined;
      job.snapshot_id = undefined;
      job.stage = undefined;

      await this.atomicWriteJson(this.getJobPath(id), job);

      // Clean up previous results and reports if any
      const rawPath = this.getRawPath(id);
      const reportPath = this.getReportPath(id);
      if (fs.existsSync(rawPath)) await fs.promises.unlink(rawPath).catch(() => {});
      if (fs.existsSync(reportPath)) await fs.promises.unlink(reportPath).catch(() => {});
    });
  }

  async deleteJob(id: string): Promise<void> {
    this.validateId(id);
    await this.withLock(id, async () => {
      const jobPath = this.getJobPath(id);
      const rawPath = this.getRawPath(id);
      const reportPath = this.getReportPath(id);

      if (fs.existsSync(jobPath)) await fs.promises.unlink(jobPath).catch(() => {});
      if (fs.existsSync(rawPath)) await fs.promises.unlink(rawPath).catch(() => {});
      if (fs.existsSync(reportPath)) await fs.promises.unlink(reportPath).catch(() => {});
    });
  }

  async deleteAllJobs(excludeDemo: boolean = true): Promise<void> {
    const jobs = await this.getAllJobs();
    for (const job of jobs) {
      if (excludeDemo && job.original_prompt.startsWith("[DEMO]")) {
        continue;
      }
      await this.deleteJob(job.id);
    }
  }

  async enforceJobLimit(limit: number = 5, excludeDemo: boolean = true): Promise<void> {
    const jobs = await this.getAllJobs();
    const liveJobs = excludeDemo
      ? jobs.filter((j) => !j.original_prompt.startsWith("[DEMO]"))
      : jobs;

    if (liveJobs.length > limit) {
      const toDelete = liveJobs.slice(limit);
      for (const job of toDelete) {
        await this.deleteJob(job.id);
      }
    }
  }

  async findCachedJobByPrompt(
    prompt: string,
    ttlMs: number = 48 * 60 * 60 * 1000
  ): Promise<ScrapingJob | null> {
    const cleanPrompt = prompt.trim().toLowerCase();
    const cutoff = Date.now() - ttlMs;
    const all = await this.getAllJobs();

    const match = all.find(
      (j) =>
        j.original_prompt.trim().toLowerCase() === cleanPrompt &&
        j.status === "completed" &&
        j.completed_at &&
        j.completed_at >= cutoff &&
        j.seo_report
    );

    return match || null;
  }

  async createJobFromCache(
    id: string,
    prompt: string,
    cachedJob: ScrapingJob
  ): Promise<ScrapingJob> {
    this.validateId(id);
    return this.withLock(id, async () => {
      const now = Date.now();
      const job: ScrapingJob = {
        id,
        original_prompt: prompt,
        status: "completed",
        created_at: now,
        completed_at: now,
      };

      await this.atomicWriteJson(this.getJobPath(id), job);

      if (cachedJob.results) {
        await this.atomicWriteJson(this.getRawPath(id), cachedJob.results);
      }
      if (cachedJob.seo_report) {
        await this.atomicWriteJson(this.getReportPath(id), cachedJob.seo_report);
      }

      job.results = cachedJob.results;
      job.seo_report = cachedJob.seo_report;
      return job;
    });
  }

  /**
   * Recovers jobs interrupted by sudden server crash / restart.
   * If a job was left in pending, running, or analyzing when server shut down,
   * mark it as failed with a helpful restart note rather than leaving the UI spinner spinning forever.
   */
  async recoverInterruptedJobs(): Promise<number> {
    const jobs = await this.getAllJobs();
    let recoveredCount = 0;

    for (const job of jobs) {
      if (["pending", "running", "analyzing"].includes(job.status)) {
        await this.failJob(
          job.id,
          "Job was interrupted by an application restart or shutdown. You can safely retry it."
        );
        recoveredCount++;
      }
    }

    if (recoveredCount > 0) {
      console.log(`[JsonStorage] Recovered ${recoveredCount} interrupted jobs from previous session.`);
    }

    return recoveredCount;
  }
}
