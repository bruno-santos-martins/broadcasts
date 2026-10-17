import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import type { Contact, CreateContactDTO, UpdateContactDTO } from '../types/contact';
import * as contactService from '../services/contactService';
import { useAuth } from './useAuth';

export const useContacts = (connectionId?: string) => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sincronização em tempo real nativa com onSnapshot do Cloud Firestore
  useEffect(() => {
    if (!user) {
      setContacts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = connectionId
      ? query(
          collection(db, 'contacts'),
          where('userId', '==', user.id),
          where('connectionId', '==', connectionId)
        )
      : query(
          collection(db, 'contacts'),
          where('userId', '==', user.id)
        );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((docSnap) =>
          contactService.mapDocToContact(docSnap.id, docSnap.data())
        );

        // Ordena por nome alfabético para visualização agradável
        list.sort((a, b) => a.name.localeCompare(b.name));

        setContacts(list);
        setLoading(false);
      },
      (err) => {
        console.error('[useContacts] Erro no onSnapshot:', err);
        setError('Falha ao sincronizar contatos em tempo real.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, connectionId]);

  const addContact = async (dto: CreateContactDTO): Promise<Contact> => {
    if (!user) throw new Error('Usuário não autenticado.');
    return contactService.createContact(user.id, dto);
  };

  const updateContact = async (id: string, dto: UpdateContactDTO): Promise<void> => {
    if (!user) throw new Error('Usuário não autenticado.');
    await contactService.updateContact(id, dto);
  };

  const removeContact = async (id: string): Promise<void> => {
    if (!user) throw new Error('Usuário não autenticado.');
    await contactService.deleteContact(id);
  };

  return {
    contacts,
    loading,
    error,
    refresh: () => {
      // onSnapshot mantém reatividade contínua
    },
    addContact,
    updateContact,
    removeContact,
  };
};
