import type { PrismaClient } from '@/generated/prisma/client';
import type { KnowledgeGraphData, KnowledgeGraphNode, KnowledgeGraphEdge } from '@/modules/knowledge-map/domain/entities';

function normalizeKeyword(text: string) {
  return text.trim().toLowerCase();
}

export async function getKnowledgeGraph(userId: string, deps: { prisma: PrismaClient }): Promise<KnowledgeGraphData> {
  const articles = await deps.prisma.article.findMany({
    where: { userId, stage: 'LIBRARY' },
    include: {
      authors: { include: { author: true } },
      projects: { include: { project: true } },
      tags: { include: { tag: true } },
      journal: true,
    },
  });

  const nodes = new Map<string, KnowledgeGraphNode>();
  const edges: KnowledgeGraphEdge[] = [];
  let edgeSeq = 0;

  function addNode(node: KnowledgeGraphNode) {
    const existing = nodes.get(node.id);
    if (existing) {
      existing.articleCount = (existing.articleCount ?? 0) + 1;
      return;
    }
    nodes.set(node.id, { ...node, articleCount: 1 });
  }

  function addEdge(source: string, target: string, kind: KnowledgeGraphEdge['kind']) {
    edgeSeq += 1;
    edges.push({ id: `auto-${edgeSeq}`, source, target, origin: 'AUTO', kind });
  }

  const yearGroups = new Map<number, string[]>();
  const keywordLabels = new Map<string, string>();

  for (const article of articles) {
    const articleNodeId = `article:${article.id}`;
    addNode({
      id: articleNodeId,
      type: 'article',
      label: article.title,
      refId: article.id,
      meta: { year: article.year, status: article.status, favorite: article.favorite },
    });

    for (const { author } of article.authors) {
      const authorNodeId = `author:${author.id}`;
      addNode({ id: authorNodeId, type: 'author', label: author.name, refId: author.id });
      addEdge(articleNodeId, authorNodeId, 'author');
    }

    for (const { project } of article.projects) {
      const projectNodeId = `project:${project.id}`;
      addNode({ id: projectNodeId, type: 'project', label: project.name, refId: project.id });
      addEdge(articleNodeId, projectNodeId, 'project');
    }

    for (const { tag } of article.tags) {
      const tagNodeId = `tag:${tag.id}`;
      addNode({ id: tagNodeId, type: 'tag', label: tag.name, refId: tag.id });
      addEdge(articleNodeId, tagNodeId, 'tag');
    }

    if (article.journal) {
      const journalNodeId = `journal:${article.journal.id}`;
      addNode({ id: journalNodeId, type: 'journal', label: article.journal.name, refId: article.journal.id });
      addEdge(articleNodeId, journalNodeId, 'journal');
    }

    const keywords = Array.isArray(article.keywords) ? (article.keywords as string[]) : [];
    for (const keyword of keywords) {
      const normalized = normalizeKeyword(keyword);
      if (!normalized) continue;
      keywordLabels.set(normalized, keywordLabels.get(normalized) ?? keyword.trim());
      const keywordNodeId = `keyword:${normalized}`;
      addNode({ id: keywordNodeId, type: 'keyword', label: keywordLabels.get(normalized)!, refId: normalized });
      addEdge(articleNodeId, keywordNodeId, 'keyword');
    }

    if (article.year) {
      const list = yearGroups.get(article.year) ?? [];
      list.push(articleNodeId);
      yearGroups.set(article.year, list);
    }
  }

  // Temporal proximity: connect articles published in the same year directly,
  // capped so a big single-year cluster doesn't produce a dense hairball.
  for (const articleIds of yearGroups.values()) {
    if (articleIds.length < 2 || articleIds.length > 12) continue;
    for (let i = 0; i < articleIds.length; i++) {
      for (let j = i + 1; j < articleIds.length; j++) {
        addEdge(articleIds[i], articleIds[j], 'year');
      }
    }
  }

  // Registered citations between articles already in the library (Phase 2 feature - schema
  // is ready, table is empty until citation extraction ships, so this is a no-op for now).
  const references = await deps.prisma.reference.findMany({
    where: { citingArticle: { userId }, matchedArticleId: { not: null } },
  });
  for (const reference of references) {
    if (!reference.matchedArticleId) continue;
    const sourceId = `article:${reference.citingArticleId}`;
    const targetId = `article:${reference.matchedArticleId}`;
    if (nodes.has(sourceId) && nodes.has(targetId)) {
      addEdge(sourceId, targetId, 'citation');
    }
  }

  // Manual connections the user created explicitly between two articles.
  const manualEdges = await deps.prisma.knowledgeMapEdge.findMany({
    where: { userId },
    include: { source: true, target: true },
  });
  for (const edge of manualEdges) {
    const sourceId = `article:${edge.source.articleId}`;
    const targetId = `article:${edge.target.articleId}`;
    if (nodes.has(sourceId) && nodes.has(targetId)) {
      edges.push({
        id: edge.id,
        source: sourceId,
        target: targetId,
        origin: 'MANUAL',
        kind: edge.connectionType as KnowledgeGraphEdge['kind'],
        note: edge.note,
      });
    }
  }

  return { nodes: Array.from(nodes.values()), edges };
}
