import api, { useMockApi } from './api';
import { API_ENDPOINTS } from './config';
import { mockCancelReservation, mockCreateReservation, mockListReservations } from './mockApi';
import type { PaginatedResponse, Reservation, ReservationFilters } from '../../types';

export const reservasService = {
  async listar(filters: ReservationFilters): Promise<PaginatedResponse<Reservation>> {
    if (useMockApi) return mockListReservations(filters);
    const { data } = await api.get<PaginatedResponse<Reservation>>(API_ENDPOINTS.reservas, { params: filters });
    return data;
  },
  async criar(input: Pick<Reservation, 'usuario_id' | 'livro_id'>): Promise<Reservation> {
    if (useMockApi) return mockCreateReservation(input);
    const { data } = await api.post<Reservation>(API_ENDPOINTS.reservas, input);
    return data;
  },
  async cancelar(id: number): Promise<void> {
    if (useMockApi) {
      await mockCancelReservation(id);
      return;
    }
    await api.delete<{ mensagem: string; reserva: Pick<Reservation, 'id' | 'status'> }>(`${API_ENDPOINTS.reservas}/${id}`);
  },
};
