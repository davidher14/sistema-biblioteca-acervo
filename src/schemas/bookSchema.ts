import { z } from 'zod';

export const bookSchema = z.object({
  titulo: z.string().trim().min(2, 'Informe um título com pelo menos 2 caracteres.').max(180, 'O título deve ter no máximo 180 caracteres.'),
  autor: z.string().trim().min(2, 'Informe o nome do autor.').max(120, 'O autor deve ter no máximo 120 caracteres.'),
  categoria: z.string().trim().min(2, 'Informe uma categoria.').max(80, 'A categoria deve ter no máximo 80 caracteres.'),
  isbn: z.string().trim().min(10, 'Informe um ISBN válido.').max(20, 'O ISBN deve ter no máximo 20 caracteres.'),
  ano: z.coerce.number().int('Informe um ano válido.').min(1, 'Informe um ano válido.').max(new Date().getFullYear() + 1, 'O ano não pode estar no futuro.'),
  quantidade_total: z.coerce.number().int().min(0, 'A quantidade não pode ser negativa.'),
  quantidade_disponivel: z.coerce.number().int().min(0, 'A quantidade não pode ser negativa.'),
}).refine((book) => book.quantidade_disponivel <= book.quantidade_total, {
  message: 'A quantidade disponível não pode exceder o total.',
  path: ['quantidade_disponivel'],
});

export type BookFormValues = z.infer<typeof bookSchema>;
