import { z } from 'zod';

export const categorySchema = z.object({
  nome: z.string()
    .trim()
    .min(2, 'Informe um nome com pelo menos 2 caracteres.')
    .max(80, 'O nome deve ter no máximo 80 caracteres.'),
  descricao: z.string()
    .trim()
    .max(240, 'A descrição deve ter no máximo 240 caracteres.'),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
