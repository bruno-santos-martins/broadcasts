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
 * Caso de Uso: Processamento de Disparos Agendados (Worker Assíncrono).
 * 
 * Separação de Responsabilidades (Clean Architecture / Functional):
 * Esta função orquestra o fluxo de negócio de ponta a ponta sem se acoplar
 * aos detalhes de transporte (HTTP ou Cloud Scheduler):
 * 
 * 1. Determina o marco temporal oficial da execução com Timestamp do Firestore.
 * 2. Consulta o repositório em busca de mensagens agendadas vencidas.
 * 3. Se não houver itens, encerra rapidamente com log informativo (early return).
 * 4. Havendo itens, efetua a transição de estado atômica para 'SENT'.
 * 5. Retorna um sumário tipado com a contagem de itens processados para auditoria.
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

  // Executa a transição de status em lote de forma atômica
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
