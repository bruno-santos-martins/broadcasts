import type { Timestamp, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { db } from '../config/firebase';
import type { BroadcastDoc } from '../types/broadcast';

const BROADCASTS_COLLECTION = 'broadcasts';
const FIRESTORE_BATCH_LIMIT = 500;

/**
 * Consulta puramente funcional para buscar disparos com status SCHEDULED
 * cujo agendamento seja menor ou igual ao Timestamp atual.
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
 * Atualiza atomicamente uma lista de documentos de transmissão para o status 'SENT'
 * utilizando db.batch(), particionando em blocos seguros de até 500 escritas.
 */
export const updateBroadcastsToSent = async (
  docs: QueryDocumentSnapshot<BroadcastDoc>[],
  sentAt: Timestamp
): Promise<void> => {
  if (docs.length === 0) return;

  // Divide em lotes de até 500 operações (limite do Firestore)
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
