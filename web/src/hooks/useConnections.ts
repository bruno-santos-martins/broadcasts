import { useState, useEffect, useCallback } from 'react';
import type { Connection, CreateConnectionDTO, UpdateConnectionDTO } from '../types/connection';
import * as connectionService from '../services/connectionService';
import { useAuth } from './useAuth';

export const useConnections = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadConnections = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await connectionService.fetchConnections(user.id);
      setConnections(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha ao carregar conexões.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const addConnection = async (dto: CreateConnectionDTO): Promise<Connection> => {
    if (!user) throw new Error('Usuário não autenticado.');
    const created = await connectionService.createConnection(user.id, dto);
    setConnections((prev) => [created, ...prev]);
    return created;
  };

  const updateConnection = async (id: string, dto: UpdateConnectionDTO): Promise<Connection> => {
    if (!user) throw new Error('Usuário não autenticado.');
    const updated = await connectionService.updateConnection(user.id, id, dto);
    setConnections((prev) => prev.map((item) => (item.id === id ? updated : item)));
    return updated;
  };

  const removeConnection = async (id: string): Promise<void> => {
    if (!user) throw new Error('Usuário não autenticado.');
    await connectionService.deleteConnection(user.id, id);
    setConnections((prev) => prev.filter((item) => item.id !== id));
  };

  return {
    connections,
    loading,
    error,
    refresh: loadConnections,
    addConnection,
    updateConnection,
    removeConnection,
  };
};
