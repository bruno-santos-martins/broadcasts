import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from './firebase';
import type { User, AuthCredentials, RegisterCredentials } from '../types/auth';

/**
 * Registra um novo usuário no Firebase Authentication.
 * Atribui nome opcional via updateProfile.
 */
export const registerUser = async (
  email: string,
  password: string,
  name?: string
): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const fbUser = userCredential.user;

  if (name && fbUser) {
    try {
      await updateProfile(fbUser, { displayName: name });
    } catch (profileErr) {
      console.warn('[authService] Aviso ao atualizar displayName:', profileErr);
    }
  }

  return {
    id: fbUser.uid,
    email: fbUser.email || email,
    name: name || fbUser.displayName || email.split('@')[0],
  };
};

/**
 * Autentica um usuário existente no Firebase Authentication com e-mail e senha.
 */
export const loginUser = async (email: string, password: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const fbUser = userCredential.user;

  return {
    id: fbUser.uid,
    email: fbUser.email || email,
    name: fbUser.displayName || email.split('@')[0],
  };
};

/**
 * Encerra a sessão ativa do usuário no Firebase Authentication.
 */
export const logoutUser = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

// Aliases para manter total compatibilidade com chamadas existentes no AuthContext/LoginPage
export const login = async (credentials: AuthCredentials): Promise<User> => {
  if (!credentials.email || !credentials.password) {
    throw new Error('E-mail e senha são obrigatórios.');
  }
  return loginUser(credentials.email, credentials.password);
};

export const register = async (credentials: RegisterCredentials): Promise<User> => {
  if (!credentials.email || !credentials.password) {
    throw new Error('E-mail e senha são obrigatórios.');
  }
  return registerUser(credentials.email, credentials.password, credentials.name);
};

export const signOut = logoutUser;
