import type { Storage } from './storage.interface';
import { LocalFilesystemStorage } from './local-filesystem-storage';
import { GoogleDriveStorage } from './google-drive-storage';

let cached: Storage | null = null;

export function getStorage(): Storage {
  if (cached) return cached;

  const provider = process.env.STORAGE_PROVIDER ?? 'local';

  if (provider === 'google_drive') {
    cached = new GoogleDriveStorage();
  } else {
    cached = new LocalFilesystemStorage(process.env.STORAGE_ROOT ?? './storage');
  }

  return cached;
}
