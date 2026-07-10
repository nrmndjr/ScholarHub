'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { SummaryTab } from './SummaryTab';
import { HighlightsTab } from './HighlightsTab';
import { CommentsTab } from './CommentsTab';
import { ReferenceTab } from './ReferenceTab';
import type { ArticleData, HighlightItem, CommentItem } from '../types';

export function RightPanelTabs({
  article,
  highlights,
  comments,
  onJumpToPage,
}: {
  article: ArticleData;
  highlights: HighlightItem[];
  comments: CommentItem[];
  onJumpToPage: (page: number) => void;
}) {
  return (
    <Tabs defaultValue="summary" className="flex h-full flex-col">
      <TabsList className="mx-3 mt-3">
        <TabsTrigger value="summary">Resumo</TabsTrigger>
        <TabsTrigger value="highlights">Destaques</TabsTrigger>
        <TabsTrigger value="comments">Comentários</TabsTrigger>
        <TabsTrigger value="reference">Referência</TabsTrigger>
      </TabsList>

      <div className="flex-1 overflow-y-auto p-3">
        <TabsContent value="summary">
          <SummaryTab articleId={article.id} initialContent={article.summaryContent} />
        </TabsContent>
        <TabsContent value="highlights">
          <HighlightsTab articleId={article.id} highlights={highlights} onJumpToPage={onJumpToPage} />
        </TabsContent>
        <TabsContent value="comments">
          <CommentsTab articleId={article.id} comments={comments} onJumpToPage={onJumpToPage} />
        </TabsContent>
        <TabsContent value="reference">
          <ReferenceTab
            article={{
              title: article.title,
              authors: article.authors,
              journalName: article.journal,
              year: article.year,
              volume: article.volume,
              issue: article.issue,
              pages: article.pages,
              doi: article.doi,
              url: article.url,
            }}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
}
