import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

/**
 * Configuração das credenciais do Firebase.
 * Em desenvolvimento local com emuladores, chaves fictícias são totalmente aceitas pelo Firebase SDK.
 */
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-zap-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'desafio-broadcast-zap.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'desafio-broadcast-zap',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'desafio-broadcast-zap.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:abcdef123456',
};

// Inicialização segura Singleton do Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Instâncias de Autenticação e Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

// Conexão aos Emuladores Oficiais do Firebase em modo de desenvolvimento
// Protegido por flag global para evitar erro de reconexão duplicada no Vite Hot Module Replacement (HMR)
const globalState = globalThis as unknown as { _firebaseEmulatorsConnected?: boolean };

if (import.meta.env.DEV && !globalState._firebaseEmulatorsConnected) {
  try {
    // Porta padrão do Firebase Auth Emulator: 9099
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    // Porta padrão do Cloud Firestore Emulator: 8080
    connectFirestoreEmulator(db, 'localhost', 8080);

    globalState._firebaseEmulatorsConnected = true;
    console.info('[Firebase] Conectado com sucesso aos Emuladores Locais (Auth: 9099, Firestore: 8080)');
  } catch (err) {
    console.warn('[Firebase] Aviso ao conectar aos emuladores:', err);
  }
}
