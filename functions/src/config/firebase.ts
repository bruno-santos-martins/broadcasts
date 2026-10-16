import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

/**
 * Inicialização segura do Firebase Admin SDK.
 * Garante que initializeApp() só seja chamado uma única vez no ciclo de vida da Function.
 */
if (getApps().length === 0) {
  initializeApp();
}

/**
 * Instância singleton do Firestore para reutilização nas camadas de repositório.
 */
export const db: Firestore = getFirestore();
