import { promises as fs, createReadStream } from 'node:fs';
import path from 'node:path';
import type { Storage, StoredFileRef } from './storage.interface';

export class LocalFilesystemStorage implements Storage {
  constructor(private readonly root: string) {}

  private resolvePath(key: string) {
    return path.join(this.root, key);
  }

  async save(input: {
    userId: string;
    articleId: string;
    filename: string;
    buffer: Buffer;
    mimeType: string;
  }): Promise<StoredFileRef> {
    const key = `users/${input.userId}/articles/${input.articleId}/original.pdf`;
    const fullPath = this.resolvePath(key);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, input.buffer);
    return { provider: 'local', key };
  }

  async getStream(ref: StoredFileRef, range?: { start: number; end: number }): Promise<NodeJS.ReadableStream> {
    const fullPath = this.resolvePath(ref.key);
    return createReadStream(fullPath, range ? { start: range.start, end: range.end } : undefined);
  }

  async getSize(ref: StoredFileRef): Promise<number> {
    const stat = await fs.stat(this.resolvePath(ref.key));
    return stat.size;
  }

  async delete(ref: StoredFileRef): Promise<void> {
    await fs.rm(this.resolvePath(ref.key), { force: true });
  }
}
