import { z } from 'zod';

export const loanSchema = z.object({
  usuario_id: z.coerce.number().int().positive('Selecione um usuário.'),
  livro_id: z.coerce.number().int().positive('Selecione um livro.'),
  data_emprestimo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe uma data válida.'),
  data_prevista_devolucao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe uma data válida.'),
}).refine((values) => values.data_prevista_devolucao > values.data_emprestimo, {
  message: 'A devolução prevista deve ocorrer depois do empréstimo.',
  path: ['data_prevista_devolucao'],
});

export type LoanFormValues = z.infer<typeof loanSchema>;
