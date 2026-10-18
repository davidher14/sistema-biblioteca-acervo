import api, { useMockApi } from './api';
import { API_ENDPOINTS } from './config';
import { mockCreateBook, mockDeleteBook, mockListBooks, mockUpdateBook } from './mockApi';
import type { Book, BookFilters, PaginatedResponse } from '../../types';

export type BookInput = Omit<Book, 'id'>;

export const livrosService = {
  async listar(filters: BookFilters): Promise<PaginatedResponse<Book>> {
    if (useMockApi) return mockListBooks(filters);
    const { data } = await api.get<PaginatedResponse<Book>>(API_ENDPOINTS.livros, { params: filters });
    return data;
  },
  async criar(input: BookInput): Promise<Book> {
    if (useMockApi) return mockCreateBook(input);
    const { data } = await api.post<Book>(API_ENDPOINTS.livros, input);
    return data;
  },
  async atualizar(id: number, input: BookInput): Promise<Book> {
    if (useMockApi) return mockUpdateBook(id, input);
    const { data } = await api.put<Book>(`${API_ENDPOINTS.livros}/${id}`, input);
    return data;
  },
  async excluir(id: number): Promise<void> {
    if (useMockApi) return mockDeleteBook(id);
    await api.delete(`${API_ENDPOINTS.livros}/${id}`);
  },
};
