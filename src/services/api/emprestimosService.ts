import api, { useMockApi } from './api';
import { API_ENDPOINTS } from './config';
import { mockApproveLoan, mockCreateLoan, mockListLoans, mockRejectLoanRequest, mockRequestLoan, mockReturnLoan } from './mockApi';
import type { Loan, LoanFilters, PaginatedResponse } from '../../types';

export type LoanCreateInput = Pick<Loan, 'usuario_id' | 'livro_id' | 'data_emprestimo' | 'data_prevista_devolucao'>;

export const emprestimosService = {
  async listar(filters: LoanFilters): Promise<PaginatedResponse<Loan>> {
    if (useMockApi) return mockListLoans(filters);
    const { data } = await api.get<PaginatedResponse<Loan>>(API_ENDPOINTS.emprestimos, { params: filters });
    return data;
  },
  async criar(input: LoanCreateInput): Promise<Loan> {
    if (useMockApi) return mockCreateLoan(input);
    const { data } = await api.post<Loan>(API_ENDPOINTS.emprestimos, input);
    return data;
  },
  async solicitar(livro_id: number): Promise<Loan> {
    if (useMockApi) return mockRequestLoan(livro_id);
    const { data } = await api.post<Loan>(`${API_ENDPOINTS.emprestimos}/solicitacoes`, { livro_id });
    return data;
  },
  async aprovar(id: number): Promise<Loan> {
    if (useMockApi) return mockApproveLoan(id);
    const { data } = await api.put<Loan>(`${API_ENDPOINTS.emprestimos}/${id}/aprovacao`, {});
    return data;
  },
  async recusar(id: number): Promise<Loan> {
    if (useMockApi) return mockRejectLoanRequest(id);
    const { data } = await api.put<Loan>(`${API_ENDPOINTS.emprestimos}/${id}/recusa`, {});
    return data;
  },
  async devolver(id: number): Promise<Loan> {
    if (useMockApi) return mockReturnLoan(id);
    const { data } = await api.put<Loan>(`${API_ENDPOINTS.emprestimos}/${id}/devolucao`, {});
    return data;
  },
};
