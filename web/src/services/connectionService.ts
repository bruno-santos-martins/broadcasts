import type { Connection, CreateConnectionDTO, UpdateConnectionDTO } from '../types/connection';

const STORAGE_KEY = '@unnichat:connections';

const INITIAL_CONNECTIONS: Connection[] = [
  {
    id: 'conn-1',
    userId: 'user-123',
    name: 'WhatsApp Comercial',
    phone: '+55 11 98765-4321',
    status: 'CONNECTED',
    createdAt: '2025-01-10T10:00:00.000Z',
  },
  {
    id: 'conn-2',
    userId: 'user-123',
    name: 'Suporte SAC',
    phone: '+55 11 91234-5678',
    status: 'CONNECTED',
    createdAt: '2025-01-15T14:30:00.000Z',
  },
];

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

const getStoredConnections = (): Connection[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as Connection[];
    }
  } catch (err) {
    console.error('Erro ao ler conexões do localStorage:', err);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CONNECTIONS));
  return INITIAL_CONNECTIONS;
};

const persistConnections = (connections: Connection[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(connections));
  } catch (err) {
    console.error('Erro ao salvar conexões no localStorage:', err);
  }
};

export const fetchConnections = async (userId: string): Promise<Connection[]> => {
  await delay();
  const all = getStoredConnections();
  return all.filter((item) => item.userId === userId);
};

export const fetchConnectionById = async (userId: string, id: string): Promise<Connection | null> => {
  await delay();
  const all = getStoredConnections();
  const found = all.find((item) => item.id === id && item.userId === userId);
  return found || null;
};

export const createConnection = async (userId: string, dto: CreateConnectionDTO): Promise<Connection> => {
  await delay();
  const all = getStoredConnections();
  const newConnection: Connection = {
    id: `conn-${Date.now()}`,
    userId,
    name: dto.name,
    phone: dto.phone,
    status: dto.status || 'CONNECTED',
    createdAt: new Date().toISOString(),
  };

  const updated = [newConnection, ...all];
  persistConnections(updated);
  return newConnection;
};

export const updateConnection = async (
  userId: string,
  id: string,
  dto: UpdateConnectionDTO
): Promise<Connection> => {
  await delay();
  const all = getStoredConnections();
  const index = all.findIndex((item) => item.id === id && item.userId === userId);

  if (index === -1) {
    throw new Error('Conexão não encontrada.');
  }

  const updatedItem: Connection = {
    ...all[index],
    ...dto,
  };

  const updatedList = [...all];
  updatedList[index] = updatedItem;
  persistConnections(updatedList);
  return updatedItem;
};

export const deleteConnection = async (userId: string, id: string): Promise<void> => {
  await delay();
  const all = getStoredConnections();
  const filtered = all.filter((item) => !(item.id === id && item.userId === userId));
  persistConnections(filtered);
};
