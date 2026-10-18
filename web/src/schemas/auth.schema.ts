import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string('O e-mail é obrigatório')
    .trim()
    .min(1, 'O e-mail é obrigatório')
    .email('Insira um e-mail válido com @ (ex: usuario@empresa.com)'),
  password: z
    .string('A senha é obrigatória')
    .min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

export const registerSchema = z.object({
  name: z
    .string('O nome é obrigatório')
    .trim()
    .min(2, 'O nome deve ter pelo menos 2 caracteres')
    .max(100, 'O nome deve ter no máximo 100 caracteres'),
  email: z
    .string('O e-mail é obrigatório')
    .trim()
    .min(1, 'O e-mail é obrigatório')
    .email('Insira um e-mail válido com @ (ex: usuario@empresa.com)'),
  password: z
    .string('A senha é obrigatória')
    .min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
