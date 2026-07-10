'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { MetadataEditForm, type ArticleMetadataDefaults } from './MetadataEditForm';
import {
  updateMetadataAction,
  setFolderAction,
  setTagsAction,
  setProjectsAction,
  archiveAction,
  createFolderAction,
  createTagAction,
} from '../actions';

export interface InboxItemDialogData {
  articleId: string;
  metadata: ArticleMetadataDefaults;
  folderId: string | null;
  tagIds: string[];
  projectIds: string[];
}

export function InboxItemDialog({
  open,
  onOpenChange,
  item,
  folders,
  tags,
  projects,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InboxItemDialogData;
  folders: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  projects: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [folderId, setFolderId] = useState(item.folderId ?? '');
  const [tagIds, setTagIds] = useState(new Set(item.tagIds));
  const [projectIds, setProjectIds] = useState(new Set(item.projectIds));
  const [archiving, setArchiving] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newTagName, setNewTagName] = useState('');

  async function handleFolderChange(value: string) {
    setFolderId(value);
    await setFolderAction(item.articleId, value || null);
    router.refresh();
  }

  async function handleToggleTag(tagId: string) {
    const next = new Set(tagIds);
    if (next.has(tagId)) next.delete(tagId);
    else next.add(tagId);
    setTagIds(next);
    await setTagsAction(item.articleId, Array.from(next));
    router.refresh();
  }

  async function handleToggleProject(projectId: string) {
    const next = new Set(projectIds);
    if (next.has(projectId)) next.delete(projectId);
    else next.add(projectId);
    setProjectIds(next);
    await setProjectsAction(item.articleId, Array.from(next));
    router.refresh();
  }

  async function handleCreateFolder() {
    if (!newFolderName.trim()) return;
    const folder = await createFolderAction(newFolderName.trim());
    setNewFolderName('');
    await handleFolderChange(folder.id);
  }

  async function handleCreateTag() {
    if (!newTagName.trim()) return;
    const tag = await createTagAction(newTagName.trim());
    setNewTagName('');
    await handleToggleTag(tag.id);
  }

  async function handleArchive() {
    setArchiving(true);
    try {
      await archiveAction(item.articleId);
      toast.success('Artigo arquivado na Biblioteca');
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao arquivar');
    } finally {
      setArchiving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Editar artigo" className="max-w-lg">
      <Tabs defaultValue="metadata">
        <TabsList>
          <TabsTrigger value="metadata">Metadados</TabsTrigger>
          <TabsTrigger value="organize">Organizar</TabsTrigger>
        </TabsList>

        <TabsContent value="metadata" className="mt-4 max-h-[60vh] overflow-y-auto pr-1">
          <MetadataEditForm
            defaults={item.metadata}
            onSave={async (data) => {
              await updateMetadataAction(item.articleId, data);
              router.refresh();
            }}
          />
        </TabsContent>

        <TabsContent value="organize" className="mt-4 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Pasta</label>
            <select
              value={folderId}
              onChange={(e) => handleFolderChange(e.target.value)}
              className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            >
              <option value="">Sem pasta</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            <div className="flex gap-2 pt-1">
              <input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Nova pasta"
                className="h-8 flex-1 rounded-md border border-neutral-300 bg-white px-2 text-xs dark:border-neutral-700 dark:bg-neutral-900"
              />
              <Button type="button" size="sm" variant="secondary" onClick={handleCreateFolder}>
                Criar
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Tags</label>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleToggleTag(tag.id)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                    tagIds.has(tag.id)
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-neutral-300 text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-400'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Nova tag"
                className="h-8 flex-1 rounded-md border border-neutral-300 bg-white px-2 text-xs dark:border-neutral-700 dark:bg-neutral-900"
              />
              <Button type="button" size="sm" variant="secondary" onClick={handleCreateTag}>
                Criar
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Projetos</label>
            <div className="flex flex-wrap gap-1.5">
              {projects.length === 0 && (
                <p className="text-xs text-neutral-400">Nenhum projeto criado ainda.</p>
              )}
              {projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => handleToggleProject(project.id)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                    projectIds.has(project.id)
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-neutral-300 text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-400'
                  }`}
                >
                  {project.name}
                </button>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-5 border-t border-neutral-200 pt-4 dark:border-neutral-800">
        <Button onClick={handleArchive} disabled={archiving} className="w-full">
          {archiving ? 'Arquivando...' : 'Arquivar para Biblioteca'}
        </Button>
      </div>
    </Dialog>
  );
}
