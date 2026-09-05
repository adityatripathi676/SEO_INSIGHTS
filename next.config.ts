import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  // Suppress Turbopack warning about better-sqlite3 (native addon)
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
