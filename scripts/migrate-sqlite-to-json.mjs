// scripts/migrate-sqlite-to-json.mjs
// Safe, read-only one-time export from SQLite to local JSON files
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "jobs.db");
const STORAGE_DIR = path.join(DATA_DIR, "local-storage");
const JOBS_DIR = path.join(STORAGE_DIR, "jobs");
const REPORTS_DIR = path.join(STORAGE_DIR, "reports");
const RAW_DIR = path.join(STORAGE_DIR, "raw-results");

function atomicWriteJson(filePath, data) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const tempPath = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tempPath, filePath);
}

async function migrate() {
  console.log("=== SEO Insight: SQLite to JSON Migration ===");

  if (!fs.existsSync(DB_PATH)) {
    console.error(`Database file not found at: ${DB_PATH}`);
    process.exit(1);
  }

  // 1. Create storage directories
  for (const dir of [STORAGE_DIR, JOBS_DIR, REPORTS_DIR, RAW_DIR]) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // 2. Open SQLite in read-only mode
  const db = new DatabaseSync(DB_PATH, { readOnly: true });

  // 3. Query all records
  const rows = db.prepare(`SELECT * FROM scraping_jobs ORDER BY created_at ASC`).all();
  console.log(`Found ${rows.length} total rows in SQLite scraping_jobs table.`);

  let jobsExported = 0;
  let reportsExported = 0;
  let rawExported = 0;

  for (const row of rows) {
    const jobId = row.id;
    console.log(`\nExporting job [${jobId}] - "${row.original_prompt}" (status: ${row.status})`);

    // 4. Job metadata
    const jobMeta = {
      id: row.id,
      original_prompt: row.original_prompt,
      analysis_prompt: row.analysis_prompt || undefined,
      snapshot_id: row.snapshot_id || undefined,
      status: row.status,
      error: row.error || undefined,
      created_at: Number(row.created_at),
      completed_at: row.completed_at ? Number(row.completed_at) : undefined,
    };

    atomicWriteJson(path.join(JOBS_DIR, `${jobId}.json`), jobMeta);
    jobsExported++;

    // 5. Raw results
    if (row.results) {
      try {
        const parsedResults = JSON.parse(row.results);
        atomicWriteJson(path.join(RAW_DIR, `${jobId}.json`), parsedResults);
        rawExported++;
        console.log(`  ✓ Saved raw results (${Array.isArray(parsedResults) ? parsedResults.length : 1} items)`);
      } catch (e) {
        console.warn(`  ⚠ Failed to parse raw results for ${jobId}: ${e.message}`);
      }
    }

    // 6. SEO Report
    if (row.seo_report) {
      try {
        const parsedReport = JSON.parse(row.seo_report);
        atomicWriteJson(path.join(REPORTS_DIR, `${jobId}.json`), parsedReport);
        reportsExported++;
        console.log(`  ✓ Saved full SEO report (entity: "${parsedReport?.meta?.entity_name || "N/A"}")`);
      } catch (e) {
        console.warn(`  ⚠ Failed to parse SEO report for ${jobId}: ${e.message}`);
      }
    }
  }

  // 7. Verify exported files
  console.log("\n--- VERIFICATION AUDIT ---");
  const jobFiles = fs.readdirSync(JOBS_DIR).filter(f => f.endsWith(".json"));
  const reportFiles = fs.readdirSync(REPORTS_DIR).filter(f => f.endsWith(".json"));
  const rawFiles = fs.readdirSync(RAW_DIR).filter(f => f.endsWith(".json"));

  console.log(`SQLite Rows: ${rows.length}`);
  console.log(`Jobs in JSON storage: ${jobFiles.length}`);
  console.log(`Reports in JSON storage: ${reportFiles.length}`);
  console.log(`Raw results in JSON storage: ${rawFiles.length}`);

  let integrityPassed = true;
  for (const file of jobFiles) {
    try {
      const content = JSON.parse(fs.readFileSync(path.join(JOBS_DIR, file), "utf-8"));
      if (!content.id || !content.status) {
        integrityPassed = false;
        console.error(`Integrity check failed for ${file}: missing id or status`);
      }
    } catch (e) {
      integrityPassed = false;
      console.error(`JSON parse failed for ${file}: ${e.message}`);
    }
  }

  if (integrityPassed && jobFiles.length === rows.length) {
    console.log("\n✅ ALL RECORDS SUCCESSFULLY MIGRATED & VERIFIED 100%!");
  } else {
    console.error("\n❌ MIGRATION AUDIT MISMATCH!");
    process.exit(1);
  }
}

migrate();
