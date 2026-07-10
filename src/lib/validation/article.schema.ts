import { z } from 'zod';

export const updateArticleMetadataSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(500),
  authors: z.array(z.string().min(1)).default([]),
  year: z.coerce.number().int().min(1000).max(3000).optional().or(z.literal('').transform(() => undefined)),
  journal: z.string().max(300).optional(),
  doi: z.string().max(200).optional(),
  url: z.string().max(2000).optional(),
  abstractText: z.string().max(5000).optional(),
  keywords: z.array(z.string().min(1)).default([]),
});

export type UpdateArticleMetadataInput = z.infer<typeof updateArticleMetadataSchema>;
