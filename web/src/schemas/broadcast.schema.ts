import { z } from 'zod';

export const broadcastComposerSchema = z
  .object({
    connectionId: z
      .string('Selecione uma conexão')
      .min(1, 'Selecione uma conexão para o disparo'),
    message: z
      .string('Digite a mensagem')
      .trim()
      .min(1, 'Digite a mensagem a ser disparada no campo Input')
      .max(4096, 'A mensagem não pode ultrapassar 4096 caracteres'),
    contactIds: z
      .array(z.string())
      .min(1, 'Selecione pelo menos um contato de destino'),
    isScheduled: z.boolean().default(false),
    scheduledFor: z.string().optional().nullable(),
  })
  .refine(
    (data) => !data.isScheduled || (data.isScheduled && Boolean(data.scheduledFor)),
    {
      message: 'Defina a data e hora do agendamento',
      path: ['scheduledFor'],
    }
  );

export type BroadcastComposerFormData = z.infer<typeof broadcastComposerSchema>;
