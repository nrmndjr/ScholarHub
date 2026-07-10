import type { PrismaClient } from '@/generated/prisma/client';

function normalizeName(name: string) {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase();
}

/** Replaces the article's author list with the given names, deduping Author rows by normalized name. */
export async function setArticleAuthors(articleId: string, authorNames: string[], deps: { prisma: PrismaClient }) {
  await deps.prisma.articleAuthor.deleteMany({ where: { articleId } });

  for (let i = 0; i < authorNames.length; i++) {
    const name = authorNames[i].trim();
    if (!name) continue;
    const normalizedName = normalizeName(name);

    const author =
      (await deps.prisma.author.findFirst({ where: { normalizedName } })) ??
      (await deps.prisma.author.create({ data: { name, normalizedName } }));

    await deps.prisma.articleAuthor.create({
      data: { articleId, authorId: author.id, position: i },
    });
  }
}

export async function setArticleJournal(articleId: string, journalName: string, deps: { prisma: PrismaClient }) {
  const journal =
    (await deps.prisma.journal.findFirst({ where: { name: journalName } })) ??
    (await deps.prisma.journal.create({ data: { name: journalName } }));

  await deps.prisma.article.update({ where: { id: articleId }, data: { journalId: journal.id } });
}
