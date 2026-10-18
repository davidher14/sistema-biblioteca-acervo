import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/api/authService';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.me,
    retry: false,
  });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const handleUnauthorized = () => {
      setExpired(true);
      queryClient.setQueryData(['auth', 'me'], null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [queryClient]);

  const login = useCallback(async (email: string, senha: string) => {
    const loggedUser = await authService.login(email, senha);
    setExpired(false);
    queryClient.setQueryData(['auth', 'me'], loggedUser);
    return loggedUser;
  }, [queryClient]);

  const logout = useCallback(async () => {
    await authService.logout();
    setExpired(true);
    queryClient.setQueryData(['auth', 'me'], null);
    queryClient.removeQueries({
      predicate: (query) => query.queryKey[0] !== 'auth',
    });
  }, [queryClient]);

  const value = useMemo(() => ({
    user: user ?? null,
    loading: isLoading && !expired,
    login,
    logout,
  }), [user, isLoading, expired, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  return context;
}
