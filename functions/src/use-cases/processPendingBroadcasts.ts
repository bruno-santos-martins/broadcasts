import { Timestamp } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import {
  findPendingScheduledBroadcasts,
  updateBroadcastsToSent,
} from '../repositories/broadcastRepository';

export interface ProcessPendingResult {
  processedCount: number;
  timestamp: string;
}

/**
 * Caso de uso funcional que orquestra a busca e o disparo de mensagens agendadas.
 * Identifica broadcasts pendentes vencidos e efetua a transição de status atômica.
 */
export const processPendingBroadcasts = async (): Promise<ProcessPendingResult> => {
  const now = Timestamp.now();
  const isoTime = now.toDate().toISOString();

  logger.info(`[Worker:processPendingBroadcasts] Iniciando verificação de agendamentos em ${isoTime}...`);

  const pendingDocs = await findPendingScheduledBroadcasts(now);

  if (pendingDocs.length === 0) {
    logger.info('[Worker:processPendingBroadcasts] Nenhum disparo agendado pendente para processamento.');
    return {
      processedCount: 0,
      timestamp: isoTime,
    };
  }

  logger.info(
    `[Worker:processPendingBroadcasts] Encontrados ${pendingDocs.length} disparo(s) para envio imediato.`
  );

  await updateBroadcastsToSent(pendingDocs, now);

  const docIds = pendingDocs.map((doc) => doc.id);
  logger.info(
    `[Worker:processPendingBroadcasts] Sucesso! ${pendingDocs.length} disparo(s) atualizados para SENT. IDs: [${docIds.join(', ')}]`
  );

  return {
    processedCount: pendingDocs.length,
    timestamp: isoTime,
  };
};
