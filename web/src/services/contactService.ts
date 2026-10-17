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
import type { Contact, CreateContactDTO, UpdateContactDTO } from '../types/contact';

const CONTACTS_COLLECTION = 'contacts';

/**
 * Converte documento Firestore para o tipo Contact da aplicação
 */
export const mapDocToContact = (id: string, data: Record<string, unknown>): Contact => {
  let createdAtStr = new Date().toISOString();
  if (data.createdAt instanceof Timestamp) {
    createdAtStr = data.createdAt.toDate().toISOString();
  } else if (typeof data.createdAt === 'string') {
    createdAtStr = data.createdAt;
  }

  return {
    id,
    userId: String(data.userId || ''),
    connectionId: String(data.connectionId || ''),
    name: String(data.name || ''),
    phone: String(data.phone || ''),
    email: data.email ? String(data.email) : undefined,
    createdAt: createdAtStr,
  };
};

/**
 * Busca contatos do usuário na coleção raiz /contacts
 * Suporta filtro opcional por connectionId
 */
export const fetchContacts = async (
  userId: string,
  connectionId?: string
): Promise<Contact[]> => {
  const q = connectionId
    ? query(
        collection(db, CONTACTS_COLLECTION),
        where('userId', '==', userId),
        where('connectionId', '==', connectionId)
      )
    : query(
        collection(db, CONTACTS_COLLECTION),
        where('userId', '==', userId)
      );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => mapDocToContact(d.id, d.data()));
};

/**
 * Busca um contato por ID isolado pelo userId
 */
export const fetchContactById = async (userId: string, id: string): Promise<Contact | null> => {
  const docRef = doc(db, CONTACTS_COLLECTION, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  if (data.userId !== userId) return null;
  return mapDocToContact(snapshot.id, data);
};

/**
 * Cria um contato na coleção raiz /contacts
 * Suporta (userId, connectionId, name, phone, email?) ou (userId, dto)
 */
export const createContact = async (
  userId: string,
  connectionIdOrDto: string | CreateContactDTO,
  nameParam?: string,
  phoneParam?: string,
  emailParam?: string
): Promise<Contact> => {
  const isDto = typeof connectionIdOrDto === 'object';
  const connectionId = isDto ? connectionIdOrDto.connectionId : connectionIdOrDto;
  const name = isDto ? connectionIdOrDto.name : (nameParam || '');
  const phone = isDto ? connectionIdOrDto.phone : (phoneParam || '');
  const email = isDto ? connectionIdOrDto.email : emailParam;

  const docData = {
    userId,
    connectionId,
    name: name.trim(),
    phone: phone.trim(),
    email: email ? email.trim() : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, CONTACTS_COLLECTION), docData);

  return {
    id: docRef.id,
    userId,
    connectionId,
    name: docData.name,
    phone: docData.phone,
    email: docData.email || undefined,
    createdAt: new Date().toISOString(),
  };
};

/**
 * Atualiza um contato existente na coleção raiz /contacts
 * Suporta (id, name, phone) ou (id, dto)
 */
export const updateContact = async (
  id: string,
  nameOrDto: string | UpdateContactDTO,
  phoneParam?: string
): Promise<void> => {
  const isDto = typeof nameOrDto === 'object';
  const updateData: Record<string, unknown> = isDto
    ? { ...nameOrDto, updatedAt: serverTimestamp() }
    : {
        name: nameOrDto.trim(),
        ...(phoneParam ? { phone: phoneParam.trim() } : {}),
        updatedAt: serverTimestamp(),
      };

  const docRef = doc(db, CONTACTS_COLLECTION, id);
  await updateDoc(docRef, updateData);
};

/**
 * Exclui um contato na coleção raiz /contacts
 */
export const deleteContact = async (id: string): Promise<void> => {
  const docRef = doc(db, CONTACTS_COLLECTION, id);
  await deleteDoc(docRef);
};
