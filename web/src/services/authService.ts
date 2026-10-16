import type { User, AuthCredentials, RegisterCredentials } from '../types/auth';

const STORAGE_KEY = '@unnichat:auth_user';

const DEFAULT_MOCK_USER: User = {
  id: 'user-123',
  email: 'admin@unnichat.com',
  name: 'Admin UnniChat',
};

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const getStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as User;
    }
  } catch (err) {
    console.error('Erro ao ler usuário salvo no localStorage:', err);
  }
  // Valor padrão inicial para o mock de prototipagem
  return DEFAULT_MOCK_USER;
};

export const saveStoredUser = (user: User | null): void => {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (err) {
    console.error('Erro ao salvar usuário no localStorage:', err);
  }
};

export const login = async (credentials: AuthCredentials): Promise<User> => {
  await delay(400);

  // Simula validação básica
  if (!credentials.email) {
    throw new Error('E-mail é obrigatório.');
  }

  const authenticatedUser: User = {
    id: credentials.email === DEFAULT_MOCK_USER.email ? DEFAULT_MOCK_USER.id : `user-${Date.now()}`,
    email: credentials.email,
    name: credentials.email.split('@')[0].toUpperCase(),
  };

  saveStoredUser(authenticatedUser);
  return authenticatedUser;
};

export const register = async (credentials: RegisterCredentials): Promise<User> => {
  await delay(400);

  if (!credentials.email || !credentials.name) {
    throw new Error('Nome e e-mail são obrigatórios.');
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    email: credentials.email,
    name: credentials.name,
  };

  saveStoredUser(newUser);
  return newUser;
};

export const signOut = async (): Promise<void> => {
  await delay(200);
  saveStoredUser(null);
};
