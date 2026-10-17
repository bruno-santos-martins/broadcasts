import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

/**
 * Inicialização Singleton do Firebase Admin SDK.
 * 
 * Por que fazemos essa checagem com getApps()?
 * Em ambientes serverless (Cloud Functions), instâncias podem ser reutilizadas 
 * entre execuções (warm starts). Verificar se já existe uma app inicializada evita 
 * erros de "FirebaseApp already exists" e economiza conexões com o banco.
 * 
 * O projectId utiliza a variável GCLOUD_PROJECT injetada pelo ambiente do GCP/Firebase,
 * mantendo 'desafio-gcp-zap' como fallback para execução transparente nos emuladores locais.
 */
if (getApps().length === 0) {
  initializeApp({
    projectId: process.env.GCLOUD_PROJECT || 'desafio-gcp-zap',
  });
}

/**
 * Instância exportada do Firestore para reutilização nas camadas de repositório.
 * Centralizar a conexão aqui garante consistência e facilita eventuais mocks em testes unitários.
 */
export const db: Firestore = getFirestore();
