import type { Contact, CreateContactDTO, UpdateContactDTO } from '../types/contact';

const STORAGE_KEY = '@unnichat:contacts';

const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'ct-1',
    userId: 'user-123',
    connectionId: 'conn-1',
    name: 'Carlos Oliveira',
    phone: '+55 11 99999-1111',
    email: 'carlos@empresa.com',
    createdAt: '2025-01-12T09:15:00.000Z',
  },
  {
    id: 'ct-2',
    userId: 'user-123',
    connectionId: 'conn-1',
    name: 'Mariana Santos',
    phone: '+55 11 98888-2222',
    email: 'mariana.santos@gmail.com',
    createdAt: '2025-01-14T11:20:00.000Z',
  },
  {
    id: 'ct-3',
    userId: 'user-123',
    connectionId: 'conn-2',
    name: 'Roberto Fernandes',
    phone: '+55 21 97777-3333',
    email: 'roberto@parceiro.com.br',
    createdAt: '2025-01-16T15:45:00.000Z',
  },
  {
    id: 'ct-4',
    userId: 'user-123',
    connectionId: 'conn-2',
    name: 'Fernanda Lima',
    phone: '+55 31 96666-4444',
    email: 'fernanda.lima@tech.io',
    createdAt: '2025-01-18T17:10:00.000Z',
  },
];

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

const getStoredContacts = (): Contact[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as Contact[];
    }
  } catch (err) {
    console.error('Erro ao ler contatos do localStorage:', err);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CONTACTS));
  return INITIAL_CONTACTS;
};

const persistContacts = (contacts: Contact[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  } catch (err) {
    console.error('Erro ao salvar contatos no localStorage:', err);
  }
};

export const fetchContacts = async (userId: string, connectionId?: string): Promise<Contact[]> => {
  await delay();
  const all = getStoredContacts();
  return all.filter((item) => {
    if (item.userId !== userId) return false;
    if (connectionId && item.connectionId !== connectionId) return false;
    return true;
  });
};

export const fetchContactById = async (userId: string, id: string): Promise<Contact | null> => {
  await delay();
  const all = getStoredContacts();
  const found = all.find((item) => item.id === id && item.userId === userId);
  return found || null;
};

export const createContact = async (userId: string, dto: CreateContactDTO): Promise<Contact> => {
  await delay();
  const all = getStoredContacts();
  const newContact: Contact = {
    id: `ct-${Date.now()}`,
    userId,
    connectionId: dto.connectionId,
    name: dto.name,
    phone: dto.phone,
    email: dto.email,
    createdAt: new Date().toISOString(),
  };

  const updated = [newContact, ...all];
  persistContacts(updated);
  return newContact;
};

export const updateContact = async (
  userId: string,
  id: string,
  dto: UpdateContactDTO
): Promise<Contact> => {
  await delay();
  const all = getStoredContacts();
  const index = all.findIndex((item) => item.id === id && item.userId === userId);

  if (index === -1) {
    throw new Error('Contato não encontrado.');
  }

  const updatedItem: Contact = {
    ...all[index],
    ...dto,
  };

  const updatedList = [...all];
  updatedList[index] = updatedItem;
  persistContacts(updatedList);
  return updatedItem;
};

export const deleteContact = async (userId: string, id: string): Promise<void> => {
  await delay();
  const all = getStoredContacts();
  const filtered = all.filter((item) => !(item.id === id && item.userId === userId));
  persistContacts(filtered);
};
