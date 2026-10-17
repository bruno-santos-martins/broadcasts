import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import type { Connection, CreateConnectionDTO, UpdateConnectionDTO } from '../types/connection';
import * as connectionService from '../services/connectionService';
import { useAuth } from './useAuth';

export const useConnections = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sincronização em tempo real nativa com onSnapshot do Cloud Firestore
  useEffect(() => {
    if (!user) {
      setConnections([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(db, 'connections'),
      where('userId', '==', user.id)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((docSnap) =>
          connectionService.mapDocToConnection(docSnap.id, docSnap.data())
        );

        // Ordena no client por createdAt descrescente para garantir ordenação estável
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setConnections(list);
        setLoading(false);
      },
      (err) => {
        console.error('[useConnections] Erro no onSnapshot:', err);
        setError('Falha ao sincronizar conexões em tempo real.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addConnection = async (dto: CreateConnectionDTO): Promise<Connection> => {
    if (!user) throw new Error('Usuário não autenticado.');
    return connectionService.createConnection(user.id, dto);
  };

  const updateConnection = async (id: string, dto: UpdateConnectionDTO): Promise<void> => {
    if (!user) throw new Error('Usuário não autenticado.');
    await connectionService.updateConnection(id, dto);
  };

  const removeConnection = async (id: string): Promise<void> => {
    if (!user) throw new Error('Usuário não autenticado.');
    await connectionService.deleteConnection(id);
  };

  return {
    connections,
    loading,
    error,
    refresh: () => {
      // O onSnapshot mantém a lista sempre atualizada automaticamente
    },
    addConnection,
    updateConnection,
    removeConnection,
  };
};
