import { useState, useEffect, useCallback } from 'react';
import type { Contact, CreateContactDTO, UpdateContactDTO } from '../types/contact';
import * as contactService from '../services/contactService';
import { useAuth } from './useAuth';

export const useContacts = (connectionId?: string) => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadContacts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await contactService.fetchContacts(user.id, connectionId);
      setContacts(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha ao carregar contatos.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user, connectionId]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const addContact = async (dto: CreateContactDTO): Promise<Contact> => {
    if (!user) throw new Error('Usuário não autenticado.');
    const created = await contactService.createContact(user.id, dto);
    setContacts((prev) => [created, ...prev]);
    return created;
  };

  const updateContact = async (id: string, dto: UpdateContactDTO): Promise<Contact> => {
    if (!user) throw new Error('Usuário não autenticado.');
    const updated = await contactService.updateContact(user.id, id, dto);
    setContacts((prev) => prev.map((item) => (item.id === id ? updated : item)));
    return updated;
  };

  const removeContact = async (id: string): Promise<void> => {
    if (!user) throw new Error('Usuário não autenticado.');
    await contactService.deleteContact(user.id, id);
    setContacts((prev) => prev.filter((item) => item.id !== id));
  };

  return {
    contacts,
    loading,
    error,
    refresh: loadContacts,
    addContact,
    updateContact,
    removeContact,
  };
};
