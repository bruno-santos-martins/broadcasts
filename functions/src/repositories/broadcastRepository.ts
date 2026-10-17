import type { Timestamp, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { db } from '../config/firebase';
import type { BroadcastDoc } from '../types/broadcast';

const BROADCASTS_COLLECTION = 'broadcasts';

/**
 * Limite de segurança de operações em um único Batch do Firestore (máximo suportado pela Google).
 * Fatiar as escritas em lotes de 500 previne falhas de overflow se houver centenas de disparos acumulados.
 */
const FIRESTORE_BATCH_LIMIT = 500;

/**
 * Busca na coleção raiz /broadcasts todos os documentos agendados (SCHEDULED)
 * cujo horário programado (scheduledAt) já venceu em relação ao momento atual (now).
 * 
 * Estratégia de Consulta:
 * - A consulta filtra por status == 'SCHEDULED' e scheduledAt <= now.
 * - Toda a persistência é mantida em coleção raiz plana (sem subcoleções aninhadas),
 *   respeitando o isolamento multi-tenant por foreign keys (userId).
 */
export const findPendingScheduledBroadcasts = async (
  now: Timestamp
): Promise<QueryDocumentSnapshot<BroadcastDoc>[]> => {
  const snapshot = await db
    .collection(BROADCASTS_COLLECTION)
    .where('status', '==', 'SCHEDULED')
    .where('scheduledAt', '<=', now)
    .get();

  return snapshot.docs as QueryDocumentSnapshot<BroadcastDoc>[];
};

/**
 * Atualiza o status dos disparos de 'SCHEDULED' para 'SENT' de forma atômica (db.batch).
 * 
 * Por que usar Batch Commit?
 * 1. Atomicidade: Garante que todos os disparos do lote sejam atualizados juntos.
 * 2. Performance: Em vez de fazer 100 requisições HTTP individuais ao banco, 
 *    fazemos apenas 1 chamada de rede em lote, reduzindo latência e custo de I/O.
 * 3. Chunks: Se houver mais de 500 itens, particionamos os blocos com slice 
 *    para respeitar rigorosamente as cotas da Google Cloud.
 */
export const updateBroadcastsToSent = async (
  docs: QueryDocumentSnapshot<BroadcastDoc>[],
  sentAt: Timestamp
): Promise<void> => {
  if (docs.length === 0) return;

  for (let i = 0; i < docs.length; i += FIRESTORE_BATCH_LIMIT) {
    const batch = db.batch();
    const chunk = docs.slice(i, i + FIRESTORE_BATCH_LIMIT);

    for (const doc of chunk) {
      batch.update(doc.ref, {
        status: 'SENT',
        sentAt,
        updatedAt: sentAt,
      });
    }

    await batch.commit();
  }
};
