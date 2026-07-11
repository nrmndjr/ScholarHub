import { Readable } from 'node:stream';
import { put, del, head, get } from '@vercel/blob';
import type { Storage, StoredFileRef } from './storage.interface';

/**
 * Blobs are created with private access (required by this project's Blob
 * store) and read back via the authenticated SDK, never a public URL fetch.
 * The raw blob reference is still never handed to the client: every read
 * goes through our own /api/articles/[id]/file route, which enforces
 * per-user ownership before streaming the bytes back.
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
      access: 'private',
      contentType: input.mimeType,
      addRandomSuffix: false,
      allowOverwrite: true,
      token: this.token,
    });
    return { provider: 'vercel_blob', key: blob.url };
  }

  async getStream(ref: StoredFileRef, range?: { start: number; end: number }): Promise<NodeJS.ReadableStream> {
    const result = await get(ref.key, { access: 'private', token: this.token });
    if (!result || result.statusCode !== 200) {
      throw new Error('Blob not found');
    }

    if (!range) {
      return Readable.fromWeb(result.stream as import('node:stream/web').ReadableStream);
    }

    // The SDK doesn't expose ranged reads, so buffer the full object and
    // slice it in memory - fine for article-sized PDFs.
    const buffer = Buffer.from(await new Response(result.stream).arrayBuffer());
    return Readable.from(buffer.subarray(range.start, range.end + 1));
  }

  async getSize(ref: StoredFileRef): Promise<number> {
    const meta = await head(ref.key, { token: this.token });
    return meta.size;
  }

  async delete(ref: StoredFileRef): Promise<void> {
    await del(ref.key, { token: this.token });
  }
}
