'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { createProjectAction, updateProjectAction } from '../actions';

const COLOR_OPTIONS = ['#6366f1', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#14b8a6'];

export interface ProjectFormDefaults {
  id?: string;
  name: string;
  description: string;
  objective: string;
  researchQuestion: string;
  hypotheses: string[];
  keywords: string[];
  color: string;
  startDate: string;
  endDate: string;
}

const EMPTY_DEFAULTS: ProjectFormDefaults = {
  name: '',
  description: '',
  objective: '',
  researchQuestion: '',
  hypotheses: [],
  keywords: [],
  color: COLOR_OPTIONS[0],
  startDate: '',
  endDate: '',
};

function splitList(value: string) {
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

export function ProjectFormDialog({
  open,
  onOpenChange,
  defaults,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaults?: ProjectFormDefaults;
}) {
  const router = useRouter();
  const isEdit = !!defaults?.id;
  const initial = defaults ?? EMPTY_DEFAULTS;

  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [objective, setObjective] = useState(initial.objective);
  const [researchQuestion, setResearchQuestion] = useState(initial.researchQuestion);
  const [hypotheses, setHypotheses] = useState(initial.hypotheses.join(', '));
  const [keywords, setKeywords] = useState(initial.keywords.join(', '));
  const [color, setColor] = useState(initial.color);
  const [startDate, setStartDate] = useState(initial.startDate);
  const [endDate, setEndDate] = useState(initial.endDate);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const input = {
        name,
        description,
        objective,
        researchQuestion,
        hypotheses: splitList(hypotheses),
        keywords: splitList(keywords),
        color,
        startDate,
        endDate,
      };

      if (isEdit && defaults?.id) {
        await updateProjectAction(defaults.id, input);
        toast.success('Projeto atualizado');
      } else {
        await createProjectAction(input);
        toast.success('Projeto criado');
      }
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar projeto');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={isEdit ? 'Editar projeto' : 'Novo projeto'} className="max-w-lg">
      <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        <div className="space-y-1">
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Nome</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Descrição</label>
          <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Objetivo</label>
          <Textarea rows={2} value={objective} onChange={(e) => setObjective(e.target.value)} />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Pergunta de pesquisa</label>
          <Textarea rows={2} value={researchQuestion} onChange={(e) => setResearchQuestion(e.target.value)} />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Hipóteses (separadas por vírgula)
          </label>
          <Input value={hypotheses} onChange={(e) => setHypotheses(e.target.value)} />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Palavras-chave (separadas por vírgula)
          </label>
          <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Início</label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Fim previsto</label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Cor</label>
          <div className="flex gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="h-6 w-6 rounded-full ring-offset-2"
                style={{ backgroundColor: c, outline: color === c ? `2px solid ${c}` : undefined, outlineOffset: 2 }}
                aria-label={c}
              />
            ))}
          </div>
        </div>

        <Button type="submit" disabled={saving} className="w-full">
          {saving ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar projeto'}
        </Button>
      </form>
    </Dialog>
  );
}
