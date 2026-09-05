// lib/db.ts
// Local SQLite database singleton - replaces Convex for local development
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Ensure the data directory exists
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, "jobs.db");

// Singleton instance
let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL"); // Better concurrency
    _db.pragma("foreign_keys = ON");
    initSchema(_db);
  }
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS scraping_jobs (
      id TEXT PRIMARY KEY,
      original_prompt TEXT NOT NULL,
      analysis_prompt TEXT,
      snapshot_id TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      results TEXT,
      seo_report TEXT,
      error TEXT,
      created_at INTEGER NOT NULL,
      completed_at INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_created_at ON scraping_jobs(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_snapshot_id ON scraping_jobs(snapshot_id);
    CREATE INDEX IF NOT EXISTS idx_status ON scraping_jobs(status);
  `);
}

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
  results?: unknown[];
  seo_report?: unknown;
  error?: string;
  created_at: number;
  completed_at?: number;
}

// Raw row from SQLite (strings for JSON fields)
interface RawRow {
  id: string;
  original_prompt: string;
  analysis_prompt: string | null;
  snapshot_id: string | null;
  status: string;
  results: string | null;
  seo_report: string | null;
  error: string | null;
  created_at: number;
  completed_at: number | null;
}

function parseRow(row: RawRow): ScrapingJob {
  return {
    id: row.id,
    original_prompt: row.original_prompt,
    analysis_prompt: row.analysis_prompt ?? undefined,
    snapshot_id: row.snapshot_id ?? undefined,
    status: row.status as JobStatus,
    results: row.results ? JSON.parse(row.results) : undefined,
    seo_report: row.seo_report ? JSON.parse(row.seo_report) : undefined,
    error: row.error ?? undefined,
    created_at: row.created_at,
    completed_at: row.completed_at ?? undefined,
  };
}

// ─── DB Operations ───────────────────────────────────────────────────────────

export function createJob(id: string, originalPrompt: string): ScrapingJob {
  const db = getDb();
  const now = Date.now();
  db.prepare(
    `INSERT INTO scraping_jobs (id, original_prompt, status, created_at)
     VALUES (?, ?, 'pending', ?)`
  ).run(id, originalPrompt, now);

  // Automatically enforce that only the last 5 reports are saved (excluding demos)
  enforceJobLimit(5);

  return getJobById(id)!;
}

export function getJobById(id: string): ScrapingJob | null {
  const db = getDb();
  const row = db
    .prepare(`SELECT * FROM scraping_jobs WHERE id = ?`)
    .get(id) as RawRow | undefined;
  return row ? parseRow(row) : null;
}

export function getJobBySnapshotId(snapshotId: string): ScrapingJob | null {
  const db = getDb();
  const row = db
    .prepare(`SELECT * FROM scraping_jobs WHERE snapshot_id = ?`)
    .get(snapshotId) as RawRow | undefined;
  return row ? parseRow(row) : null;
}

export function getAllJobs(): ScrapingJob[] {
  const db = getDb();
  const rows = db
    .prepare(`SELECT * FROM scraping_jobs ORDER BY created_at DESC`)
    .all() as RawRow[];
  return rows.map(parseRow);
}

export function updateJobSnapshotId(id: string, snapshotId: string): void {
  const db = getDb();
  db.prepare(
    `UPDATE scraping_jobs SET snapshot_id = ?, status = 'running', error = NULL WHERE id = ?`
  ).run(snapshotId, id);
}

export function saveRawResults(id: string, results: unknown[]): void {
  const db = getDb();
  db.prepare(
    `UPDATE scraping_jobs SET results = ?, status = 'analyzing', error = NULL WHERE id = ?`
  ).run(JSON.stringify(results), id);
}

export function saveAnalysisPrompt(id: string, prompt: string): void {
  const db = getDb();
  db.prepare(
    `UPDATE scraping_jobs SET analysis_prompt = ? WHERE id = ?`
  ).run(prompt, id);
}

export function saveSeoReport(id: string, report: unknown): void {
  const db = getDb();
  db.prepare(
    `UPDATE scraping_jobs SET seo_report = ? WHERE id = ?`
  ).run(JSON.stringify(report), id);
}

export function completeJob(id: string): void {
  const db = getDb();
  db.prepare(
    `UPDATE scraping_jobs SET status = 'completed', completed_at = ?, error = NULL WHERE id = ?`
  ).run(Date.now(), id);
}

export function failJob(id: string, error: string): void {
  const db = getDb();
  db.prepare(
    `UPDATE scraping_jobs SET status = 'failed', error = ?, completed_at = ? WHERE id = ?`
  ).run(error, Date.now(), id);
}

export function retryJob(id: string): void {
  const db = getDb();
  db.prepare(
    `UPDATE scraping_jobs 
     SET status = 'pending', error = NULL, completed_at = NULL, 
         results = NULL, seo_report = NULL, snapshot_id = NULL 
     WHERE id = ?`
  ).run(id);
}

export function deleteJob(id: string): void {
  const db = getDb();
  db.prepare(`DELETE FROM scraping_jobs WHERE id = ?`).run(id);
}

export function deleteAllJobs(excludeDemo: boolean = true): void {
  const db = getDb();
  if (excludeDemo) {
    db.prepare(`DELETE FROM scraping_jobs WHERE original_prompt NOT LIKE '[DEMO]%'`).run();
  } else {
    db.prepare(`DELETE FROM scraping_jobs`).run();
  }
}

export function enforceJobLimit(limit: number = 5, excludeDemo: boolean = true): void {
  const db = getDb();
  const condition = excludeDemo ? `WHERE original_prompt NOT LIKE '[DEMO]%'` : ``;
  const additionalCondition = excludeDemo ? `AND original_prompt NOT LIKE '[DEMO]%'` : ``;
  
  db.prepare(`
    DELETE FROM scraping_jobs 
    WHERE id NOT IN (
      SELECT id FROM scraping_jobs 
      ${condition}
      ORDER BY created_at DESC 
      LIMIT ?
    )
    ${additionalCondition}
  `).run(limit);
}

// ─── Domain Caching Engine ────────────────────────────────────────────────────

/**
 * Finds a recent completed report for the exact prompt/domain within TTL (default: 48 hours)
 */
export function findCachedJobByPrompt(
  prompt: string,
  ttlMs: number = 48 * 60 * 60 * 1000
): ScrapingJob | null {
  const db = getDb();
  const cutoff = Date.now() - ttlMs;
  const row = db
    .prepare(
      `SELECT * FROM scraping_jobs 
       WHERE LOWER(original_prompt) = LOWER(?) 
         AND status = 'completed' 
         AND completed_at >= ? 
       ORDER BY completed_at DESC LIMIT 1`
    )
    .get(prompt.trim(), cutoff) as RawRow | undefined;

  return row ? parseRow(row) : null;
}

/**
 * Creates an instant completed job record by duplicating a cached report
 */
export function createJobFromCache(
  id: string,
  prompt: string,
  cachedJob: ScrapingJob
): ScrapingJob {
  const db = getDb();
  const now = Date.now();
  db.prepare(
    `INSERT INTO scraping_jobs (id, original_prompt, status, results, seo_report, created_at, completed_at)
     VALUES (?, ?, 'completed', ?, ?, ?, ?)`
  ).run(
    id,
    prompt,
    JSON.stringify(cachedJob.results ?? []),
    JSON.stringify(cachedJob.seo_report ?? {}),
    now,
    now
  );

  return getJobById(id)!;
}
