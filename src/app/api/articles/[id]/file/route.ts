import { Readable } from 'node:stream';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { getStorage } from '@/lib/storage/storage-factory';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return new Response('Não autenticado', { status: 401 });
  }

  const article = await prisma.article.findUnique({
    where: { id },
    include: { file: true },
  });

  if (!article || !article.file) {
    return new Response('Arquivo não encontrado', { status: 404 });
  }

  if (article.userId !== user.id) {
    return new Response('Acesso negado', { status: 403 });
  }

  const storage = getStorage();
  const ref = { provider: article.file.storageProvider as 'local' | 'google_drive' | 'vercel_blob', key: article.file.storageKey };
  const size = await storage.getSize(ref);

  const rangeHeader = request.headers.get('range');
  const baseHeaders = {
    'Content-Type': article.file.mimeType,
    'Accept-Ranges': 'bytes',
  };

  if (rangeHeader) {
    const match = /bytes=(\d*)-(\d*)/.exec(rangeHeader);
    const start = match?.[1] ? parseInt(match[1], 10) : 0;
    const end = match?.[2] ? parseInt(match[2], 10) : size - 1;
    const chunkSize = end - start + 1;

    const nodeStream = await storage.getStream(ref, { start, end });
    const webStream = Readable.toWeb(nodeStream as Readable) as ReadableStream;

    return new Response(webStream, {
      status: 206,
      headers: {
        ...baseHeaders,
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Content-Length': String(chunkSize),
      },
    });
  }

  const nodeStream = await storage.getStream(ref);
  const webStream = Readable.toWeb(nodeStream as Readable) as ReadableStream;

  return new Response(webStream, {
    status: 200,
    headers: {
      ...baseHeaders,
      'Content-Length': String(size),
    },
  });
}
