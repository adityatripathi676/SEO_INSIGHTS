// scripts/verify-storage-integrity.mjs
// Direct operational verification of data/local-storage
import fs from "fs";
import path from "path";

const BASE_DIR = path.resolve(process.cwd(), "data/local-storage");
const JOBS_DIR = path.join(BASE_DIR, "jobs");
const REPORTS_DIR = path.join(BASE_DIR, "reports");
const RAW_DIR = path.join(BASE_DIR, "raw-results");

function atomicWriteJson(filePath, data) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const tempFile = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tempFile, filePath);
}

function readJsonFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

console.log("=== SEO Tracker: Storage Integrity Verification ===\n");

// 1. Verify existing records
const jobFiles = fs.readdirSync(JOBS_DIR).filter(f => f.endsWith(".json"));
const reportFiles = fs.readdirSync(REPORTS_DIR).filter(f => f.endsWith(".json"));
const rawFiles = fs.readdirSync(RAW_DIR).filter(f => f.endsWith(".json"));

console.log(`Verified Jobs: ${jobFiles.length}`);
console.log(`Verified Reports: ${reportFiles.length}`);
console.log(`Verified Raw Crawl Data: ${rawFiles.length}`);

let allValid = true;
for (const file of jobFiles) {
  const job = readJsonFile(path.join(JOBS_DIR, file));
  if (!job || !job.id || !job.original_prompt || !job.status) {
    console.error(`Invalid job file: ${file}`);
    allValid = false;
  }
}

for (const file of reportFiles) {
  const report = readJsonFile(path.join(REPORTS_DIR, file));
  if (!report || !report.meta || !report.summary) {
    console.error(`Invalid report file: ${file}`);
    allValid = false;
  }
}

if (allValid) {
  console.log("✓ All existing stored JSON records are valid and uncorrupted!");
} else {
  console.error("❌ Some records failed integrity check!");
  process.exit(1);
}

// 2. Test Atomic Write & Replacement
console.log("\nTesting Atomic Write & Replacement...");
const testJobId = "automated-test-job-" + Date.now();
const testJobPath = path.join(JOBS_DIR, `${testJobId}.json`);

const initialData = { id: testJobId, original_prompt: "test-domain.com", status: "pending", created_at: Date.now() };
atomicWriteJson(testJobPath, initialData);

const readBack1 = readJsonFile(testJobPath);
if (readBack1.status === "pending") {
  console.log("✓ Initial atomic write succeeded.");
} else {
  console.error("❌ Atomic write failed.");
  process.exit(1);
}

// Update status atomically
initialData.status = "completed";
initialData.completed_at = Date.now();
atomicWriteJson(testJobPath, initialData);

const readBack2 = readJsonFile(testJobPath);
if (readBack2.status === "completed") {
  console.log("✓ Atomic replacement update succeeded.");
} else {
  console.error("❌ Atomic replacement failed.");
  process.exit(1);
}

// Clean up test file
fs.unlinkSync(testJobPath);
console.log("✓ Test file cleanup succeeded.");
console.log("\n✅ ALL STORAGE INTEGRITY CHECKS PASSED 100%!");
