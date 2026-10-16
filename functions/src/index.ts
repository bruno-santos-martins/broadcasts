import { onSchedule } from 'firebase-functions/v2/scheduler';
import { processPendingBroadcasts } from './use-cases/processPendingBroadcasts';

/**
 * Worker assíncrono agendado (Cloud Scheduler via Firebase Functions v2).
 * Executa a cada 1 minuto para processar disparos pendentes no Firestore.
 */
export const processScheduledBroadcasts = onSchedule(
  {
    schedule: 'every 1 minutes',
    timeZone: 'America/Sao_Paulo',
    region: 'us-central1',
    maxInstances: 1,
    memory: '256MiB',
  },
  async () => {
    await processPendingBroadcasts();
  }
);
