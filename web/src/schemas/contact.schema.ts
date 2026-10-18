import { z } from 'zod';

export const contactSchema = z.object({
  name: z
    .string('O nome é obrigatório')
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
  email: z
    .string()
    .trim()
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      { message: 'Insira um e-mail válido com @ (ex: contato@exemplo.com)' }
    )
    .optional(),
  connectionId: z
    .string('Selecione uma conexão WhatsApp')
    .min(1, 'Selecione uma conexão WhatsApp'),
});

export type ContactFormData = z.infer<typeof contactSchema>;
