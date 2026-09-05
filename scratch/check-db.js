const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(process.cwd(), 'data/jobs.db'));

try {
  const jobs = db.prepare('SELECT id, status, original_prompt as prompt, error FROM scraping_jobs ORDER BY created_at DESC LIMIT 5').all();
  console.log(JSON.stringify(jobs, null, 2));
} catch (err) {
  console.error(err);
} finally {
  db.close();
}
