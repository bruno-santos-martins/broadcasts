import { z } from 'zod';

export const connectionSchema = z.object({
  name: z
    .string('O nome da conexão é obrigatório')
    .trim()
    .min(2, 'O nome deve ter pelo menos 2 caracteres')
    .max(100, 'O nome deve ter no máximo 100 caracteres'),
  phone: z
    .string('O telefone é obrigatório')
    .trim()
    .min(1, 'O telefone é obrigatório')
    .regex(/^\d+$/, 'O telefone não pode conter texto, use apenas números (ex: 5521988158124)')
    .min(10, 'O telefone deve conter no mínimo 10 dígitos (DDD + número, ex: 5521988158124)')
    .max(15, 'O telefone deve ter no máximo 15 dígitos'),
});

export type ConnectionFormData = z.infer<typeof connectionSchema>;
