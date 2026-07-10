import { getCurrentUserOrThrow } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { listArticles } from '@/modules/articles/use-cases/list-articles';
import { listFolders } from '@/modules/folders/use-cases/list-folders';
import { listTags } from '@/modules/tags/use-cases/list-tags';
import { listProjects } from '@/modules/projects/use-cases/list-projects';
import { UploadDropzone } from './_components/UploadDropzone';
import { InboxList, type InboxArticleItem } from './_components/InboxList';

export default async function InboxPage() {
  const user = await getCurrentUserOrThrow();

  const [articles, folders, tags, projects] = await Promise.all([
    listArticles({ userId: user.id, stage: 'INBOX' }, { prisma }),
    listFolders(user.id, { prisma }),
    listTags(user.id, { prisma }),
    listProjects(user.id, { prisma }),
  ]);

  const items: InboxArticleItem[] = articles.map((article) => ({
    id: article.id,
    title: article.title,
    createdAt: article.createdAt.toISOString(),
    completenessScore: article.completenessScore,
    authors: article.authors.map((a) => a.author.name),
    year: article.year,
    journal: article.journal?.name ?? null,
    doi: article.doi,
    url: article.url,
    abstractText: article.abstractText,
    keywords: Array.isArray(article.keywords) ? (article.keywords as string[]) : [],
    folderId: article.folderId,
    tagIds: article.tags.map((t) => t.tagId),
    projectIds: article.projects.map((p) => p.projectId),
    originalFilename: article.file?.originalFilename ?? null,
    jobStatus: article.processingJobs[0]?.status ?? null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Inbox</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Envie PDFs, confirme os metadados e arquive para a Biblioteca.
        </p>
      </div>

      <UploadDropzone />

      <InboxList
        items={items}
        folders={folders.map((f) => ({ id: f.id, name: f.name }))}
        tags={tags.map((t) => ({ id: t.id, name: t.name }))}
        projects={projects.map((p) => ({ id: p.id, name: p.name }))}
      />
    </div>
  );
}
