import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import type { Broadcast, CreateBroadcastDTO, BroadcastFilterType } from '../types/broadcast';
import * as broadcastService from '../services/broadcastService';
import { useAuth } from './useAuth';

export const useBroadcasts = (initialFilter: BroadcastFilterType = 'ALL', connectionId?: string) => {
  const { user } = useAuth();
  const [allBroadcasts, setAllBroadcasts] = useState<Broadcast[]>([]);
  const [filter, setFilter] = useState<BroadcastFilterType>(initialFilter);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sincronização em tempo real nativa com onSnapshot do Cloud Firestore
  // Quando a Cloud Function processar e atualizar disparos agendados para SENT, a tela reflete instantaneamente!
  useEffect(() => {
    if (!user) {
      setAllBroadcasts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = connectionId
      ? query(
          collection(db, 'broadcasts'),
          where('userId', '==', user.id),
          where('connectionId', '==', connectionId)
        )
      : query(
          collection(db, 'broadcasts'),
          where('userId', '==', user.id)
        );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((docSnap) =>
          broadcastService.mapDocToBroadcast(docSnap.id, docSnap.data())
        );

        // Ordena por data decrescente (mais recentes primeiro)
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setAllBroadcasts(list);
        setLoading(false);
      },
      (err) => {
        console.error('[useBroadcasts] Erro no onSnapshot:', err);
        setError('Falha ao sincronizar disparos em tempo real.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, connectionId]);

  // Contadores globais fixos e independentes da aba selecionada
  const counts = useMemo(() => {
    return {
      all: allBroadcasts.length,
      scheduled: allBroadcasts.filter((item) => item.status === 'SCHEDULED').length,
      sent: allBroadcasts.filter((item) => item.status === 'SENT').length,
    };
  }, [allBroadcasts]);

  // Lista visível filtrada dinamicamente conforme a aba
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
    return broadcastService.createBroadcast(user.id, dto);
  };

  const removeBroadcast = async (id: string): Promise<void> => {
    if (!user) throw new Error('Usuário não autenticado.');
    await broadcastService.deleteBroadcast(id);
  };

  const updateMessage = async (id: string, message: string): Promise<void> => {
    if (!user) throw new Error('Usuário não autenticado.');
    await broadcastService.updateBroadcastMessage(id, message);
  };

  return {
    broadcasts: filteredBroadcasts,
    counts,
    filter,
    setFilter,
    loading,
    error,
    refresh: () => {
      // onSnapshot mantém reatividade contínua
    },
    addBroadcast,
    removeBroadcast,
    updateMessage,
  };
};
