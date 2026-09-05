const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(process.cwd(), 'data/jobs.db'));

const jobId = 'db31bc45-1339-4bbe-ae93-554cc0725d87';

try {
  // Check if job exists
  const job = db.prepare('SELECT * FROM scraping_jobs WHERE id = ?').get(jobId);
  if (!job) {
    console.error(`Job ${jobId} not found`);
    process.exit(1);
  }

  console.log(`Retrying job: ${jobId} (${job.original_prompt})`);

  // Reset job to pending so the server picks it up
  db.prepare(`
    UPDATE scraping_jobs 
    SET status = 'pending', error = NULL, completed_at = NULL, 
        seo_report = NULL
    WHERE id = ?
  `).run(jobId);

  console.log('Job status reset to pending. The server should process it shortly.');
} catch (err) {
  console.error(err);
} finally {
  db.close();
}
