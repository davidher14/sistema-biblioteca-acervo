import api, { useMockApi } from './api';
import { API_ENDPOINTS } from './config';
import {
  mockDashboardSummary,
  mockReportLoansByPeriod,
  mockReportOverdueLoans,
  mockReportTopBooks,
  mockReportTopUsers,
} from './mockApi';
import type {
  DashboardSummary,
  Loan,
  ReportBookRow,
  ReportFilters,
  ReportPeriodRow,
  ReportResponse,
  ReportUserRow,
} from '../../types';

export const relatoriosService = {
  async resumo(): Promise<DashboardSummary> {
    if (useMockApi) return mockDashboardSummary();
    const { data } = await api.get<DashboardSummary>(API_ENDPOINTS.dashboard);
    return data;
  },
  async livrosMaisEmprestados(filters: ReportFilters): Promise<ReportResponse<ReportBookRow[]>> {
    if (useMockApi) return mockReportTopBooks(filters);
    const { data } = await api.get<ReportResponse<ReportBookRow[]>>(`${API_ENDPOINTS.relatorios}/livros-mais-emprestados`, { params: filters });
    return data;
  },
  async emprestimosPorPeriodo(filters: ReportFilters): Promise<ReportResponse<ReportPeriodRow[]>> {
    if (useMockApi) return mockReportLoansByPeriod(filters);
    const { data } = await api.get<ReportResponse<ReportPeriodRow[]>>(`${API_ENDPOINTS.relatorios}/emprestimos-por-periodo`, { params: filters });
    return data;
  },
  async emprestimosAtrasados(filters: ReportFilters): Promise<ReportResponse<Loan[]>> {
    if (useMockApi) return mockReportOverdueLoans(filters);
    const { data } = await api.get<ReportResponse<Loan[]>>(`${API_ENDPOINTS.relatorios}/emprestimos-atrasados`, { params: filters });
    return data;
  },
  async usuariosMaisAtivos(filters: ReportFilters): Promise<ReportResponse<ReportUserRow[]>> {
    if (useMockApi) return mockReportTopUsers(filters);
    const { data } = await api.get<ReportResponse<ReportUserRow[]>>(`${API_ENDPOINTS.relatorios}/usuarios-mais-ativos`, { params: filters });
    return data;
  },
};
