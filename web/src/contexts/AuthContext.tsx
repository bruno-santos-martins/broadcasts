import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { User, AuthCredentials, RegisterCredentials, AuthState } from '../types/auth';
import * as authService from '../services/authService';

export interface AuthContextType extends AuthState {
  login: (credentials: AuthCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Inicializa o estado com o usuário mockado pré-existente
  useEffect(() => {
    const stored = authService.getStoredUser();
    setUser(stored);
    setIsLoading(false);
  }, []);

  const handleLogin = useCallback(async (credentials: AuthCredentials) => {
    setIsLoading(true);
    try {
      const loggedUser = await authService.login(credentials);
      setUser(loggedUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRegister = useCallback(async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    try {
      const newUser = await authService.register(credentials);
      setUser(newUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login: handleLogin,
      register: handleRegister,
      signOut: handleSignOut,
    }),
    [user, isLoading, handleLogin, handleRegister, handleSignOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
