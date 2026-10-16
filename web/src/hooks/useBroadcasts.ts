import { useState, useEffect, useCallback } from 'react';
import type { Broadcast, CreateBroadcastDTO, BroadcastFilterType } from '../types/broadcast';
import * as broadcastService from '../services/broadcastService';
import { useAuth } from './useAuth';

export const useBroadcasts = (initialFilter: BroadcastFilterType = 'ALL', connectionId?: string) => {
  const { user } = useAuth();
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [filter, setFilter] = useState<BroadcastFilterType>(initialFilter);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadBroadcasts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await broadcastService.fetchBroadcasts(user.id, filter, connectionId);
      setBroadcasts(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha ao carregar disparos.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user, filter, connectionId]);

  useEffect(() => {
    loadBroadcasts();
  }, [loadBroadcasts]);

  const addBroadcast = async (dto: CreateBroadcastDTO): Promise<Broadcast> => {
    if (!user) throw new Error('Usuário não autenticado.');
    const created = await broadcastService.createBroadcast(user.id, dto);
    setBroadcasts((prev) => [created, ...prev]);
    return created;
  };

  const removeBroadcast = async (id: string): Promise<void> => {
    if (!user) throw new Error('Usuário não autenticado.');
    await broadcastService.deleteBroadcast(user.id, id);
    setBroadcasts((prev) => prev.filter((item) => item.id !== id));
  };

  return {
    broadcasts,
    filter,
    setFilter,
    loading,
    error,
    refresh: loadBroadcasts,
    addBroadcast,
    removeBroadcast,
  };
};
