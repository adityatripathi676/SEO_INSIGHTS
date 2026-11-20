import { spawn } from "node:child_process";
import http from "node:http";

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, json: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    }).on("error", reject);
  });
}

async function run() {
  console.log("Starting Next.js production server on 127.0.0.1:3005...");
  const server = spawn("node", ["node_modules/next/dist/bin/next", "start", "-p", "3005", "-H", "127.0.0.1"], {
    stdio: ["ignore", "pipe", "pipe"],
  });

  server.stdout.on("data", (d) => process.stdout.write(d.toString()));
  server.stderr.on("data", (d) => process.stderr.write(d.toString()));

  // Wait for server to be ready
  let ready = false;
  for (let i = 0; i < 45; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    try {
      const res = await fetchJson("http://127.0.0.1:3005/api/stats");
      if (res.status === 200) {
        ready = true;
        console.log("Server responded 200 OK!");
        break;
      }
    } catch (err) {
      console.log("Probe error:", err.message);
    }
  }

  if (!ready) {
    server.kill();
    console.error("Server did not become ready in time.");
    process.exit(1);
  }

  try {
    const statsRes = await fetchJson("http://127.0.0.1:3005/api/stats");
    console.log("Stats API:", JSON.stringify(statsRes.json));

    const jobsRes = await fetchJson("http://127.0.0.1:3005/api/jobs");
    console.log(`Jobs API returned ${jobsRes.json?.length || 0} jobs.`);

    console.log("✅ Next.js production server live API test PASSED!");
  } finally {
    server.kill();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
