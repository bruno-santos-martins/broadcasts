import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Connection, CreateConnectionDTO, UpdateConnectionDTO } from '../types/connection';

const CONNECTIONS_COLLECTION = 'connections';

/**
 * Converte documento Firestore para o tipo Connection da aplicação
 */
export const mapDocToConnection = (id: string, data: Record<string, unknown>): Connection => {
  let createdAtStr = new Date().toISOString();
  if (data.createdAt instanceof Timestamp) {
    createdAtStr = data.createdAt.toDate().toISOString();
  } else if (typeof data.createdAt === 'string') {
    createdAtStr = data.createdAt;
  }

  return {
    id,
    userId: String(data.userId || ''),
    name: String(data.name || ''),
    phone: String(data.phone || ''),
    status: (data.status as Connection['status']) || 'CONNECTED',
    createdAt: createdAtStr,
  };
};

/**
 * Busca todas as conexões do usuário na coleção raiz /connections
 */
export const fetchConnections = async (userId: string): Promise<Connection[]> => {
  const q = query(
    collection(db, CONNECTIONS_COLLECTION),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => mapDocToConnection(d.id, d.data()));
};

/**
 * Busca uma conexão específica por ID garantindo isolamento de usuário
 */
export const fetchConnectionById = async (userId: string, id: string): Promise<Connection | null> => {
  const docRef = doc(db, CONNECTIONS_COLLECTION, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  if (data.userId !== userId) return null;
  return mapDocToConnection(snapshot.id, data);
};

/**
 * Cria uma nova conexão na coleção raiz /connections
 * Suporta assinatura direta (userId, name, phone) ou com DTO
 */
export const createConnection = async (
  userId: string,
  nameOrDto: string | CreateConnectionDTO,
  phoneParam?: string
): Promise<Connection> => {
  const isDto = typeof nameOrDto === 'object';
  const name = isDto ? nameOrDto.name : nameOrDto;
  const phone = isDto ? nameOrDto.phone : (phoneParam || '');
  const status = isDto && nameOrDto.status ? nameOrDto.status : 'CONNECTED';

  const docData = {
    userId,
    name: name.trim(),
    phone: phone.trim(),
    status,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, CONNECTIONS_COLLECTION), docData);

  return {
    id: docRef.id,
    userId,
    name: docData.name,
    phone: docData.phone,
    status,
    createdAt: new Date().toISOString(),
  };
};

/**
 * Atualiza o nome ou campos de uma conexão na coleção raiz /connections
 */
export const updateConnection = async (
  id: string,
  nameOrDto: string | UpdateConnectionDTO
): Promise<void> => {
  const isDto = typeof nameOrDto === 'object';
  const updateData: Record<string, unknown> = isDto
    ? { ...nameOrDto, updatedAt: serverTimestamp() }
    : { name: nameOrDto.trim(), updatedAt: serverTimestamp() };

  const docRef = doc(db, CONNECTIONS_COLLECTION, id);
  await updateDoc(docRef, updateData);
};

/**
 * Exclui uma conexão na coleção raiz /connections
 */
export const deleteConnection = async (id: string): Promise<void> => {
  const docRef = doc(db, CONNECTIONS_COLLECTION, id);
  await deleteDoc(docRef);
};
