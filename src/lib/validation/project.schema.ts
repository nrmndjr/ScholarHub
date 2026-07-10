import { z } from 'zod';

export const projectSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  description: z.string().max(2000).optional(),
  objective: z.string().max(2000).optional(),
  researchQuestion: z.string().max(1000).optional(),
  hypotheses: z.array(z.string().min(1)).default([]),
  keywords: z.array(z.string().min(1)).default([]),
  color: z.string().max(20).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type ProjectInput = z.infer<typeof projectSchema>;
