import type { Broadcast, CreateBroadcastDTO, BroadcastFilterType } from '../types/broadcast';

const STORAGE_KEY = '@unnichat:broadcasts';

const INITIAL_BROADCASTS: Broadcast[] = [
  {
    id: 'bc-1',
    userId: 'user-123',
    connectionId: 'conn-1',
    message: 'Olá! Gostaríamos de apresentar nossas novas soluções corporativas para otimizar seus resultados.',
    contactIds: ['ct-1', 'ct-2'],
    status: 'SCHEDULED',
    scheduledFor: '2025-09-25T18:10:00.000Z',
    createdAt: '2025-09-25T14:00:00.000Z',
    sentAt: null,
  },
  {
    id: 'bc-2',
    userId: 'user-123',
    connectionId: 'conn-1',
    message: 'Lembrete: amanhã teremos o webinar exclusivo sobre integração de chatbots no WhatsApp.',
    contactIds: ['ct-1'],
    status: 'SCHEDULED',
    scheduledFor: '2025-09-25T19:20:00.000Z',
    createdAt: '2025-09-25T15:10:00.000Z',
    sentAt: null,
  },
  {
    id: 'bc-3',
    userId: 'user-123',
    connectionId: 'conn-2',
    message: 'Seu chamado #4892 foi concluído com sucesso. Por favor, avalie nosso atendimento!',
    contactIds: ['ct-3', 'ct-4'],
    status: 'SENT',
    scheduledFor: null,
    createdAt: '2025-09-25T17:00:00.000Z',
    sentAt: '2025-09-25T17:00:05.000Z',
  },
];

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

const getStoredBroadcasts = (): Broadcast[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as Broadcast[];
    }
  } catch (err) {
    console.error('Erro ao ler broadcasts do localStorage:', err);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BROADCASTS));
  return INITIAL_BROADCASTS;
};

const persistBroadcasts = (broadcasts: Broadcast[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(broadcasts));
  } catch (err) {
    console.error('Erro ao salvar broadcasts no localStorage:', err);
  }
};

export const fetchBroadcasts = async (
  userId: string,
  filter: BroadcastFilterType = 'ALL',
  connectionId?: string
): Promise<Broadcast[]> => {
  await delay();
  const all = getStoredBroadcasts();
  return all.filter((item) => {
    if (item.userId !== userId) return false;
    if (connectionId && item.connectionId !== connectionId) return false;
    if (filter === 'SENT') return item.status === 'SENT';
    if (filter === 'SCHEDULED') return item.status === 'SCHEDULED';
    return true;
  });
};

export const createBroadcast = async (
  userId: string,
  dto: CreateBroadcastDTO
): Promise<Broadcast> => {
  await delay();
  const all = getStoredBroadcasts();
  const isScheduled = Boolean(dto.scheduledFor && new Date(dto.scheduledFor) > new Date());

  const newBroadcast: Broadcast = {
    id: `bc-${Date.now()}`,
    userId,
    connectionId: dto.connectionId,
    message: dto.message,
    contactIds: dto.contactIds,
    status: isScheduled ? 'SCHEDULED' : 'SENT',
    scheduledFor: isScheduled ? (dto.scheduledFor as string) : null,
    createdAt: new Date().toISOString(),
    sentAt: isScheduled ? null : new Date().toISOString(),
  };

  const updated = [newBroadcast, ...all];
  persistBroadcasts(updated);
  return newBroadcast;
};

export const deleteBroadcast = async (userId: string, id: string): Promise<void> => {
  await delay();
  const all = getStoredBroadcasts();
  const filtered = all.filter((item) => !(item.id === id && item.userId === userId));
  persistBroadcasts(filtered);
};
