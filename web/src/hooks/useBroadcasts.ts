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

  /**
   * Sincronização em Tempo Real via onSnapshot (WebSockets do Cloud Firestore)
   * 
   * Por que usar onSnapshot em vez de getDocs tradicional?
   * Quando a Cloud Function em background roda a cada minuto e atualiza os disparos
   * de 'SCHEDULED' para 'SENT', o Firestore envia um evento direto via WebSocket para o browser.
   * O usuário vê a tag mudar de cor e o status atualizar ao vivo, sem precisar dar F5 na página!
   */
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

        // Ordenação client-side por data mais recente para garantir estabilidade visual
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

    // Limpa a subscrição do WebSocket quando o componente é desmontado para evitar memory leaks
    return () => unsubscribe();
  }, [user, connectionId]);

  /**
   * Contadores Globais Fixos (useMemo):
   * Mantém a contagem total de 'Todas', 'Agendadas' e 'Enviadas' sempre constante,
   * mesmo quando o usuário troca de aba para filtrar a listagem.
   */
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
