import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

/**
 * Configurações do Firebase:
 * - Em Produção (GCP): Usa as variáveis injetadas pelo GitHub Actions com as credenciais reais do projeto.
 * - Em Desenvolvimento Local: Lê do .env.development.
 */
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAGAXl8FjIrbje3LHVhbkdmaz_i--Q37JI',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'desafio-broadcast-zap.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'desafio-broadcast-zap',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'desafio-broadcast-zap.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '739193491722',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:739193491722:web:77582afb6d12c1adb72af3',
};

// Singleton seguro do Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Instâncias oficiais de Autenticação e Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

// Conexão aos Emuladores Locais:
// Ativado APENAS se VITE_USE_EMULATORS for 'true' (definido em web/.env.development).
// Em produção (GCP) essa variável é falsa, garantindo conexão direta com a nuvem do Google!
const isEmulatorMode = import.meta.env.VITE_USE_EMULATORS === 'true';
const globalState = globalThis as unknown as { _firebaseEmulatorsConnected?: boolean };

if (isEmulatorMode && !globalState._firebaseEmulatorsConnected) {
  try {
    // Porta padrão do Firebase Auth Emulator: 9099
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    // Porta padrão do Cloud Firestore Emulator: 8080
    connectFirestoreEmulator(db, 'localhost', 8080);

    globalState._firebaseEmulatorsConnected = true;
    console.info('[Firebase] Modo Emulador Local Ativado (Auth: 9099, Firestore: 8080)');
  } catch (err) {
    console.warn('[Firebase] Aviso ao conectar aos emuladores:', err);
  }
} else if (!isEmulatorMode) {
  console.info('[Firebase] Conectado diretamente à nuvem do Google Cloud / Firebase (Produção)');
}
