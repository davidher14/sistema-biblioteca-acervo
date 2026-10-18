import api, { useMockApi } from './api';
import { API_ENDPOINTS } from './config';
import { mockCreateCategory, mockDeleteCategory, mockGetCategory, mockListCategories, mockUpdateCategory } from './mockApi';
import type { Category, CategoryFilters, PaginatedResponse } from '../../types';

export type CategoryInput = Omit<Category, 'id'>;

export const categoriasService = {
  async listar(filters: CategoryFilters): Promise<PaginatedResponse<Category>> {
    if (useMockApi) return mockListCategories(filters);
    const { data } = await api.get<PaginatedResponse<Category>>(API_ENDPOINTS.categorias, { params: filters });
    return data;
  },
  async listarTodas(): Promise<Category[]> {
    const porPagina = 100;
    const firstPage = await categoriasService.listar({
      pagina: 1,
      por_pagina: porPagina,
      ordenar_por: 'nome',
      ordem: 'asc',
    });
    const totalPaginas = Math.ceil(firstPage.total / porPagina);
    const remainingPages = await Promise.all(
      Array.from({ length: Math.max(0, totalPaginas - 1) }, (_, index) => categoriasService.listar({
        pagina: index + 2,
        por_pagina: porPagina,
        ordenar_por: 'nome',
        ordem: 'asc',
      })),
    );
    return [firstPage, ...remainingPages].flatMap((page) => page.dados);
  },
  async buscarPorId(id: number): Promise<Category> {
    if (useMockApi) return mockGetCategory(id);
    const { data } = await api.get<Category>(`${API_ENDPOINTS.categorias}/${id}`);
    return data;
  },
  async criar(input: CategoryInput): Promise<Category> {
    if (useMockApi) return mockCreateCategory(input);
    const { data } = await api.post<Category>(API_ENDPOINTS.categorias, input);
    return data;
  },
  async atualizar(id: number, input: CategoryInput): Promise<Category> {
    if (useMockApi) return mockUpdateCategory(id, input);
    const { data } = await api.put<Category>(`${API_ENDPOINTS.categorias}/${id}`, input);
    return data;
  },
  async excluir(id: number): Promise<void> {
    if (useMockApi) return mockDeleteCategory(id);
    await api.delete(`${API_ENDPOINTS.categorias}/${id}`);
  },
};
