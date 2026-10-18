import api, { useMockApi } from './api';
import { API_ENDPOINTS } from './config';
import { mockCreateUser, mockGetUser, mockListUsers, mockSetUserActive, mockUpdateUser } from './mockApi';
import type { ManagedUser, PaginatedResponse, UserFilters } from '../../types';

export interface UserCreateInput {
  nome: string;
  email: string;
  senha: string;
  perfil: ManagedUser['perfil'];
  ativo: true;
}

export interface UserUpdateInput {
  nome: string;
  email: string;
  senha?: string;
  perfil: ManagedUser['perfil'];
  ativo: boolean;
}

export const usuariosService = {
  async listar(filters: UserFilters): Promise<PaginatedResponse<ManagedUser>> {
    if (useMockApi) return mockListUsers(filters);
    const { data } = await api.get<PaginatedResponse<ManagedUser>>(API_ENDPOINTS.usuarios, { params: filters });
    return data;
  },
  async buscarPorId(id: number): Promise<ManagedUser> {
    if (useMockApi) return mockGetUser(id);
    const { data } = await api.get<ManagedUser>(`${API_ENDPOINTS.usuarios}/${id}`);
    return data;
  },
  async criar(input: UserCreateInput): Promise<ManagedUser> {
    if (useMockApi) return mockCreateUser(input);
    const { data } = await api.post<ManagedUser>(API_ENDPOINTS.usuarios, input);
    return data;
  },
  async atualizar(id: number, input: UserUpdateInput): Promise<ManagedUser> {
    if (useMockApi) return mockUpdateUser(id, input);
    const { data } = await api.put<ManagedUser>(`${API_ENDPOINTS.usuarios}/${id}`, input);
    return data;
  },
  async inativar(id: number): Promise<ManagedUser> {
    if (useMockApi) return mockSetUserActive(id, false);
    const { data } = await api.delete<{ mensagem: string; usuario: ManagedUser }>(`${API_ENDPOINTS.usuarios}/${id}`);
    return data.usuario;
  },
};
