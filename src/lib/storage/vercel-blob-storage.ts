import { Readable } from 'node:stream';
import { put, del, head } from '@vercel/blob';
import type { Storage, StoredFileRef } from './storage.interface';

/**
 * Blobs are created with public access (the only mode @vercel/blob supports),
 * but the raw URL is never handed to the client: every read goes through our
 * own /api/articles/[id]/file route, which enforces per-user ownership before
 * fetching and re-streaming the bytes from Blob storage.
 */
export class VercelBlobStorage implements Storage {
  private get token() {
    return process.env.BLOB_READ_WRITE_TOKEN;
  }

  async save(input: {
    userId: string;
    articleId: string;
    filename: string;
    buffer: Buffer;
    mimeType: string;
  }): Promise<StoredFileRef> {
    const pathname = `users/${input.userId}/articles/${input.articleId}/original.pdf`;
    const blob = await put(pathname, input.buffer, {
      access: 'public',
      contentType: input.mimeType,
      addRandomSuffix: false,
      allowOverwrite: true,
      token: this.token,
    });
    return { provider: 'vercel_blob', key: blob.url };
  }

  async getStream(ref: StoredFileRef, range?: { start: number; end: number }): Promise<NodeJS.ReadableStream> {
    const headers: Record<string, string> = {};
    if (range) headers.Range = `bytes=${range.start}-${range.end}`;

    const res = await fetch(ref.key, { headers });
    if (!res.ok || !res.body) {
      throw new Error(`Failed to fetch blob (status ${res.status})`);
    }
    return Readable.fromWeb(res.body as import('node:stream/web').ReadableStream);
  }

  async getSize(ref: StoredFileRef): Promise<number> {
    const meta = await head(ref.key, { token: this.token });
    return meta.size;
  }

  async delete(ref: StoredFileRef): Promise<void> {
    await del(ref.key, { token: this.token });
  }
}
