import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Broadcast, CreateBroadcastDTO, BroadcastFilterType } from '../types/broadcast';
import * as broadcastService from '../services/broadcastService';
import { useAuth } from './useAuth';

export const useBroadcasts = (initialFilter: BroadcastFilterType = 'ALL', connectionId?: string) => {
  const { user } = useAuth();
  const [allBroadcasts, setAllBroadcasts] = useState<Broadcast[]>([]);
  const [filter, setFilter] = useState<BroadcastFilterType>(initialFilter);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Carrega sempre a totalidade dos disparos do usuário para manter os contadores fixos e corretos
  const loadBroadcasts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await broadcastService.fetchBroadcasts(user.id, 'ALL', connectionId);
      setAllBroadcasts(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha ao carregar disparos.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user, connectionId]);

  useEffect(() => {
    loadBroadcasts();
  }, [loadBroadcasts]);

  // Contadores fixos e imutáveis ao trocar de aba
  const counts = useMemo(() => {
    return {
      all: allBroadcasts.length,
      scheduled: allBroadcasts.filter((item) => item.status === 'SCHEDULED').length,
      sent: allBroadcasts.filter((item) => item.status === 'SENT').length,
    };
  }, [allBroadcasts]);

  // Lista visível filtrada dinamicamente pela aba selecionada
  const filteredBroadcasts = useMemo(() => {
    if (filter === 'SCHEDULED') {
      return allBroadcasts.filter((item) => item.status === 'SCHEDULED');
    }
    if (filter === 'SENT') {
      return allBroadcasts.filter((item) => item.status === 'SENT');
    }
    return allBroadcasts;
  }, [allBroadcasts, filter]);

  const addBroadcast = async (dto: CreateBroadcastDTO): Promise<Broadcast> => {
    if (!user) throw new Error('Usuário não autenticado.');
    const created = await broadcastService.createBroadcast(user.id, dto);
    setAllBroadcasts((prev) => [created, ...prev]);
    return created;
  };

  const removeBroadcast = async (id: string): Promise<void> => {
    if (!user) throw new Error('Usuário não autenticado.');
    await broadcastService.deleteBroadcast(user.id, id);
    setAllBroadcasts((prev) => prev.filter((item) => item.id !== id));
  };

  return {
    broadcasts: filteredBroadcasts,
    counts,
    filter,
    setFilter,
    loading,
    error,
    refresh: loadBroadcasts,
    addBroadcast,
    removeBroadcast,
  };
};
