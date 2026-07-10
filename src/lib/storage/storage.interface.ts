export interface StoredFileRef {
  provider: 'local' | 'google_drive' | 'vercel_blob';
  key: string;
}

export interface Storage {
  save(input: {
    userId: string;
    articleId: string;
    filename: string;
    buffer: Buffer;
    mimeType: string;
  }): Promise<StoredFileRef>;

  getStream(ref: StoredFileRef, range?: { start: number; end: number }): Promise<NodeJS.ReadableStream>;

  getSize(ref: StoredFileRef): Promise<number>;

  delete(ref: StoredFileRef): Promise<void>;
}

export class NotImplementedError extends Error {
  constructor(feature: string) {
    super(`${feature} is not implemented yet`);
    this.name = 'NotImplementedError';
  }
}
