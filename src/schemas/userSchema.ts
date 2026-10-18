import { z } from 'zod';

export function createUserSchema(isEditing: boolean) {
  return z.object({
    nome: z.string().trim().min(2, 'Informe um nome com pelo menos 2 caracteres.').max(120, 'O nome deve ter no máximo 120 caracteres.'),
    email: z.string().trim().email('Informe um e-mail válido.').max(180, 'O e-mail deve ter no máximo 180 caracteres.'),
    senha: z.string().max(100, 'A senha deve ter no máximo 100 caracteres.'),
    perfil: z.enum(['admin', 'usuario'], { message: 'Selecione um perfil válido.' }),
  }).superRefine((values, context) => {
    if (!isEditing && values.senha.length < 8) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['senha'],
        message: 'A senha deve ter pelo menos 8 caracteres.',
      });
    }
    if (isEditing && values.senha.length > 0 && values.senha.length < 8) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['senha'],
        message: 'A nova senha deve ter pelo menos 8 caracteres.',
      });
    }
  });
}

export type UserFormValues = z.infer<ReturnType<typeof createUserSchema>>;
