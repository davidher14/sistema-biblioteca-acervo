import { z } from 'zod';

export const authorSchema = z.object({
  nome: z.string()
    .trim()
    .min(2, 'Informe um nome com pelo menos 2 caracteres.')
    .max(120, 'O nome deve ter no máximo 120 caracteres.'),
});

export type AuthorFormValues = z.infer<typeof authorSchema>;
