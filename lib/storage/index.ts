// lib/storage/index.ts
// Storage factory & lifecycle management for SEO Tracker
import { StorageProvider } from "./types";
import { JsonStorageProvider } from "./json";

export * from "./types";

let _storageInstance: StorageProvider | null = null;
let _recovered = false;

export function getStorage(): StorageProvider {
  if (!_storageInstance) {
    const provider = process.env.STORAGE_PROVIDER || "json";

    if (provider === "json") {
      _storageInstance = new JsonStorageProvider();
    } else {
      // Future-proof fallback or cloud adapter placeholder
      console.warn(`[Storage] Storage provider "${provider}" requested. Defaulting to local JSON storage.`);
      _storageInstance = new JsonStorageProvider();
    }

    // Trigger crash recovery on first access in background
    if (!_recovered) {
      _recovered = true;
      _storageInstance.recoverInterruptedJobs().catch((err) => {
        console.warn("[Storage] Interrupted job recovery check error:", err);
      });
    }
  }

  return _storageInstance;
}
