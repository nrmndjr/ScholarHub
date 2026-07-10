import type { Storage, StoredFileRef } from './storage.interface';
import { NotImplementedError } from './storage.interface';

/**
 * Future integration point: files would be uploaded to the user's Google Drive
 * using an OAuth token obtained through a Google provider on the `Account` table.
 * Annotations, metadata and reading progress stay in our own database either way —
 * only the PDF bytes move to Drive, keeping every other module storage-agnostic.
 */
export class GoogleDriveStorage implements Storage {
  async save(): Promise<StoredFileRef> {
    throw new NotImplementedError('GoogleDriveStorage.save');
  }

  async getStream(): Promise<NodeJS.ReadableStream> {
    throw new NotImplementedError('GoogleDriveStorage.getStream');
  }

  async getSize(): Promise<number> {
    throw new NotImplementedError('GoogleDriveStorage.getSize');
  }

  async delete(): Promise<void> {
    throw new NotImplementedError('GoogleDriveStorage.delete');
  }
}
