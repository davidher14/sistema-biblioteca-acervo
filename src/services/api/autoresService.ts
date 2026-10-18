import api, { useMockApi } from './api';
import { API_ENDPOINTS } from './config';
import { mockCreateAuthor, mockDeleteAuthor, mockListAuthors, mockUpdateAuthor } from './mockApi';
import type { Author, AuthorFilters, PaginatedResponse } from '../../types';

export const autoresService = {
  async listar(filters: AuthorFilters): Promise<PaginatedResponse<Author>> {
    if (useMockApi) return mockListAuthors(filters);
    const { data } = await api.get<PaginatedResponse<Author>>(API_ENDPOINTS.autores, { params: filters });
    return data;
  },
  async criar(nome: string): Promise<Author> {
    if (useMockApi) return mockCreateAuthor(nome);
    const { data } = await api.post<Author>(API_ENDPOINTS.autores, { nome });
    return data;
  },
  async atualizar(id: number, nome: string): Promise<Author> {
    if (useMockApi) return mockUpdateAuthor(id, nome);
    const { data } = await api.put<Author>(`${API_ENDPOINTS.autores}/${id}`, { nome });
    return data;
  },
  async excluir(id: number): Promise<void> {
    if (useMockApi) return mockDeleteAuthor(id);
    await api.delete(`${API_ENDPOINTS.autores}/${id}`);
  },
};
