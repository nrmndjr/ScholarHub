import { NextResponse } from 'next/server';
import { getCurrentUserOrThrow } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { getStorage } from '@/lib/storage/storage-factory';
import { createArticleFromUpload } from '@/modules/articles/use-cases/create-article-from-upload';
import { processPendingJobs } from '@/modules/processing/use-cases/process-pending-jobs';
import { UnauthorizedError, ValidationError } from '@/lib/errors';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUserOrThrow();

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const storage = getStorage();

    const article = await createArticleFromUpload(
      {
        userId: user.id,
        filename: file.name,
        buffer,
        mimeType: file.type || 'application/pdf',
      },
      { prisma, storage }
    );

    processPendingJobs({ prisma, storage }).catch((error) => {
      console.error('[upload] failed to kick off processing', error);
    });

    return NextResponse.json({ articleId: article.id }, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
