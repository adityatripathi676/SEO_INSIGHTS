// scripts/test-local-storage.mjs
// Automated verification suite for the local JSON storage engine
import { JsonStorageProvider } from "../lib/storage/json.ts";
import fs from "fs";
import path from "path";

const TEST_DIR = "./data/test-storage";

async function runTests() {
  console.log("=== SEO Tracker: Local Storage Test Suite ===\n");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAILED: ${message}`);
      failed++;
    }
  }

  // Clean test dir if exists
  const absTestDir = path.resolve(process.cwd(), TEST_DIR);
  if (fs.existsSync(absTestDir)) {
    fs.rmSync(absTestDir, { recursive: true, force: true });
  }

  const storage = new JsonStorageProvider(TEST_DIR);

  // Test 1: Create Job
  console.log("Test 1: Create Job");
  const testId = "test-job-001";
  const job = await storage.createJob(testId, "apple.com");
  assert(job.id === testId, "Job ID matches");
  assert(job.status === "pending", "Initial status is pending");
  assert(fs.existsSync(path.join(absTestDir, "jobs", `${testId}.json`)), "Job JSON file created on disk");

  // Test 2: Read Job
  console.log("\nTest 2: Read Job");
  const readJob = await storage.getJobById(testId);
  assert(readJob !== null, "Job was successfully retrieved");
  assert(readJob?.original_prompt === "apple.com", "Prompt matches");

  // Test 3: Save Raw Results
  console.log("\nTest 3: Save Raw Results");
  const mockResults = [{ url: "https://apple.com", title: "Apple Official" }];
  await storage.saveRawResults(testId, mockResults);
  const jobWithRaw = await storage.getJobById(testId);
  assert(jobWithRaw?.status === "analyzing", "Status updated to analyzing");
  assert(Array.isArray(jobWithRaw?.results) && jobWithRaw.results.length === 1, "Raw results attached");
  assert(fs.existsSync(path.join(absTestDir, "raw-results", `${testId}.json`)), "Raw results JSON exists");

  // Test 4: Save SEO Report & Complete
  console.log("\nTest 4: Save SEO Report & Complete Job");
  const mockReport = {
    meta: { entity_name: "Apple Inc.", entity_type: "business" },
    summary: { overall_score: 95 }
  };
  await storage.saveSeoReport(testId, mockReport);
  await storage.completeJob(testId);
  const completedJob = await storage.getJobById(testId);
  assert(completedJob?.status === "completed", "Status is completed");
  assert(completedJob?.completed_at !== undefined, "Completed timestamp recorded");
  assert(completedJob?.seo_report?.meta?.entity_name === "Apple Inc.", "SEO report attached correctly");

  // Test 5: Cache Engine
  console.log("\nTest 5: Domain Cache Engine");
  const cached = await storage.findCachedJobByPrompt("apple.com");
  assert(cached !== null, "Cache hit found for completed domain");
  assert(cached?.id === testId, "Cache returns correct matching job");

  const clonedId = "test-job-002";
  const cloned = await storage.createJobFromCache(clonedId, "apple.com", cached);
  assert(cloned.id === clonedId, "Cloned job created with new ID");
  assert(cloned.status === "completed", "Cloned job is immediately completed");
  assert(cloned.seo_report !== undefined, "Cloned job has complete report");

  // Test 6: Listing Jobs
  console.log("\nTest 6: List All Jobs");
  const allJobs = await storage.getAllJobs();
  assert(allJobs.length === 2, `Expected 2 jobs, found ${allJobs.length}`);
  assert(allJobs[0].created_at >= allJobs[1].created_at, "Jobs are sorted by created_at DESC");

  // Test 7: Interrupted Job Recovery
  console.log("\nTest 7: Interrupted Job Recovery");
  const interruptedId = "test-job-interrupted";
  await storage.createJob(interruptedId, "broken.com");
  await storage.updateJobStage(interruptedId, "crawling", "running");
  const recoveredCount = await storage.recoverInterruptedJobs();
  assert(recoveredCount === 1, `Recovered exactly 1 interrupted job (got ${recoveredCount})`);
  const recoveredJob = await storage.getJobById(interruptedId);
  assert(recoveredJob?.status === "failed", "Interrupted job transitioned to failed");
  assert(recoveredJob?.error?.includes("interrupted"), "Recovery message recorded");

  // Test 8: Security - Path Traversal Prevention
  console.log("\nTest 8: Security - Path Traversal Defense");
  let traversalCaught = false;
  try {
    await storage.getJobById("../../etc/passwd");
  } catch (e) {
    traversalCaught = true;
  }
  assert(traversalCaught, "Path traversal with '../' was rejected with error");

  let invalidCharsCaught = false;
  try {
    await storage.getJobById("invalid id with spaces");
  } catch (e) {
    invalidCharsCaught = true;
  }
  assert(invalidCharsCaught, "Invalid ID characters rejected");

  // Test 9: Deletion
  console.log("\nTest 9: Delete Job");
  await storage.deleteJob(testId);
  const deletedJob = await storage.getJobById(testId);
  assert(deletedJob === null, "Deleted job returns null");
  assert(!fs.existsSync(path.join(absTestDir, "jobs", `${testId}.json`)), "Job file deleted from disk");
  assert(!fs.existsSync(path.join(absTestDir, "reports", `${testId}.json`)), "Report file deleted from disk");
  assert(!fs.existsSync(path.join(absTestDir, "raw-results", `${testId}.json`)), "Raw results file deleted from disk");

  // Clean test dir
  fs.rmSync(absTestDir, { recursive: true, force: true });

  console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) process.exit(1);
}

runTests();
