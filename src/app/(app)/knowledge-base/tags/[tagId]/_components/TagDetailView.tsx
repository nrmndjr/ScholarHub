import { Card } from '@/components/ui/Card';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { HighlightResultCard } from '../../../_components/HighlightResultCard';
import { YearTimelineChart } from './YearTimelineChart';
import type { TagDetail } from '@/modules/knowledge-base/use-cases/get-tag-detail';

export function TagDetailView({ detail }: { detail: TagDetail }) {
  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb items={[{ label: 'Base de Conhecimento', href: '/knowledge-base' }, { label: detail.name }]} />
        <h1 className="text-lg font-semibold">{detail.name}</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Eixo temático — visão consolidada de tudo que você já destacou sobre este assunto.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-3">
          <p className="text-xl font-semibold">{detail.highlights.length}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Destaques</p>
        </Card>
        <Card className="p-3">
          <p className="text-xl font-semibold">{detail.articleCount}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Artigos</p>
        </Card>
        <Card className="p-3">
          <p className="text-xl font-semibold">{detail.topAuthors.length}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Autores</p>
        </Card>
        <Card className="p-3">
          <p className="text-xl font-semibold">{detail.journals.length}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Periódicos</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <YearTimelineChart data={detail.yearTimeline} />
        </div>

        <Card className="p-4">
          <h2 className="mb-2 text-sm font-semibold">Autores mais frequentes</h2>
          {detail.topAuthors.length === 0 ? (
            <p className="text-xs text-neutral-400">Nenhum autor identificado.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {detail.topAuthors.map((author) => (
                <li key={author.name} className="flex items-center justify-between gap-2">
                  <span className="truncate">{author.name}</span>
                  <span className="text-xs text-neutral-400">{author.count}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {(detail.projects.length > 0 || detail.journals.length > 0) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {detail.projects.length > 0 && (
            <Card className="p-4">
              <h2 className="mb-2 text-sm font-semibold">Projetos</h2>
              <div className="flex flex-wrap gap-1.5">
                {detail.projects.map((p) => (
                  <span key={p} className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs dark:bg-neutral-800">
                    {p}
                  </span>
                ))}
              </div>
            </Card>
          )}
          {detail.journals.length > 0 && (
            <Card className="p-4">
              <h2 className="mb-2 text-sm font-semibold">Periódicos</h2>
              <div className="flex flex-wrap gap-1.5">
                {detail.journals.map((j) => (
                  <span key={j} className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs dark:bg-neutral-800">
                    {j}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold">Todos os trechos</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {detail.highlights.map((card) => (
            <HighlightResultCard key={card.id} card={card} />
          ))}
        </div>
      </div>
    </div>
  );
}
