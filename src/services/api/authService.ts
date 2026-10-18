import api, { useMockApi } from './api';
import { API_ENDPOINTS } from './config';
import { mockLogin, mockLogout, mockMe, mockRegisterReader } from './mockApi';
import type { ManagedUser, User } from '../../types';

export const authService = {
  async register(input: { nome: string; email: string; senha: string }): Promise<ManagedUser> {
    if (useMockApi) return mockRegisterReader(input);
    const { data } = await api.post<ManagedUser>(API_ENDPOINTS.register, input);
    return data;
  },
  async login(email: string, senha: string): Promise<User> {
    if (useMockApi) return mockLogin(email, senha);
    const { data } = await api.post<User>(API_ENDPOINTS.login, { email, senha });
    return data;
  },
  async me(): Promise<User> {
    if (useMockApi) return mockMe();
    const { data } = await api.get<User>(API_ENDPOINTS.me);
    return data;
  },
  async logout(): Promise<void> {
    if (useMockApi) return mockLogout();
    await api.post(API_ENDPOINTS.logout);
  },
};
