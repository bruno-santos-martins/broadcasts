import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Broadcast, CreateBroadcastDTO, BroadcastFilterType } from '../types/broadcast';

const BROADCASTS_COLLECTION = 'broadcasts';

/**
 * Converte documento Firestore para o tipo Broadcast da aplicação web,
 * garantindo compatibilidade entre os campos do Firestore (scheduledAt, sentAt)
 * e as propriedades consumidas na UI (scheduledFor, sentAt).
 */
export const mapDocToBroadcast = (id: string, data: Record<string, unknown>): Broadcast => {
  let createdAtStr = new Date().toISOString();
  if (data.createdAt instanceof Timestamp) {
    createdAtStr = data.createdAt.toDate().toISOString();
  } else if (typeof data.createdAt === 'string') {
    createdAtStr = data.createdAt;
  }

  let scheduledForStr: string | null = null;
  if (data.scheduledAt instanceof Timestamp) {
    scheduledForStr = data.scheduledAt.toDate().toISOString();
  } else if (typeof data.scheduledAt === 'string') {
    scheduledForStr = data.scheduledAt;
  } else if (typeof data.scheduledFor === 'string') {
    scheduledForStr = data.scheduledFor;
  }

  let sentAtStr: string | null = null;
  if (data.sentAt instanceof Timestamp) {
    sentAtStr = data.sentAt.toDate().toISOString();
  } else if (typeof data.sentAt === 'string') {
    sentAtStr = data.sentAt;
  }

  return {
    id,
    userId: String(data.userId || ''),
    connectionId: String(data.connectionId || ''),
    message: String(data.message || ''),
    contactIds: Array.isArray(data.contactIds) ? (data.contactIds as string[]) : [],
    status: (data.status as Broadcast['status']) || 'SENT',
    scheduledFor: scheduledForStr,
    createdAt: createdAtStr,
    sentAt: sentAtStr,
  };
};

/**
 * Busca todos os disparos do usuário na coleção raiz /broadcasts
 */
export const fetchBroadcasts = async (
  userId: string,
  filter: BroadcastFilterType = 'ALL',
  connectionId?: string
): Promise<Broadcast[]> => {
  const q = connectionId
    ? query(
        collection(db, BROADCASTS_COLLECTION),
        where('userId', '==', userId),
        where('connectionId', '==', connectionId)
      )
    : query(
        collection(db, BROADCASTS_COLLECTION),
        where('userId', '==', userId)
      );

  const snapshot = await getDocs(q);
  const list = snapshot.docs.map((d) => mapDocToBroadcast(d.id, d.data()));

  if (filter === 'SENT') {
    return list.filter((item) => item.status === 'SENT');
  }
  if (filter === 'SCHEDULED') {
    return list.filter((item) => item.status === 'SCHEDULED');
  }
  return list;
};

/**
 * Cria um novo disparo na coleção raiz /broadcasts.
 * - Se scheduledAt for data futura: status = "SCHEDULED", scheduledAt = Timestamp.fromDate(date), sentAt = null
 * - Se for disparo imediato: status = "SENT", scheduledAt = serverTimestamp(), sentAt = serverTimestamp()
 */
export const createBroadcast = async (
  userId: string,
  connectionIdOrDto: string | CreateBroadcastDTO,
  contactIdsParam?: string[],
  messageParam?: string,
  scheduledAtParam?: Date | string | null
): Promise<Broadcast> => {
  const isDto = typeof connectionIdOrDto === 'object';
  const connectionId = isDto ? connectionIdOrDto.connectionId : connectionIdOrDto;
  const contactIds = isDto ? connectionIdOrDto.contactIds : (contactIdsParam || []);
  const message = isDto ? connectionIdOrDto.message : (messageParam || '');
  const rawScheduledAt = isDto ? connectionIdOrDto.scheduledFor : scheduledAtParam;

  let scheduledDate: Date | null = null;
  if (rawScheduledAt instanceof Date) {
    scheduledDate = rawScheduledAt;
  } else if (typeof rawScheduledAt === 'string' && rawScheduledAt.trim() !== '') {
    scheduledDate = new Date(rawScheduledAt);
  }

  const isFuture = Boolean(scheduledDate && scheduledDate.getTime() > Date.now());

  let docData: Record<string, unknown>;

  if (isFuture && scheduledDate) {
    docData = {
      userId,
      connectionId,
      contactIds,
      message: message.trim(),
      status: 'SCHEDULED',
      scheduledAt: Timestamp.fromDate(scheduledDate),
      sentAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
  } else {
    docData = {
      userId,
      connectionId,
      contactIds,
      message: message.trim(),
      status: 'SENT',
      scheduledAt: serverTimestamp(),
      sentAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
  }

  const docRef = await addDoc(collection(db, BROADCASTS_COLLECTION), docData);

  return {
    id: docRef.id,
    userId,
    connectionId,
    contactIds,
    message: message.trim(),
    status: isFuture ? 'SCHEDULED' : 'SENT',
    scheduledFor: isFuture && scheduledDate ? scheduledDate.toISOString() : null,
    createdAt: new Date().toISOString(),
    sentAt: isFuture ? null : new Date().toISOString(),
  };
};

/**
 * Atualiza o texto da mensagem de um disparo na coleção raiz /broadcasts
 */
export const updateBroadcastMessage = async (id: string, message: string): Promise<void> => {
  const docRef = doc(db, BROADCASTS_COLLECTION, id);
  await updateDoc(docRef, {
    message: message.trim(),
    updatedAt: serverTimestamp(),
  });
};

/**
 * Exclui um disparo na coleção raiz /broadcasts
 */
export const deleteBroadcast = async (userIdOrId: string, idParam?: string): Promise<void> => {
  const id = idParam ? idParam : userIdOrId;
  const docRef = doc(db, BROADCASTS_COLLECTION, id);
  await deleteDoc(docRef);
};
