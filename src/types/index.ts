export type UserRole = 'admin' | 'usuario';

export interface User {
  id: number;
  nome: string;
  email: string;
  perfil: UserRole;
}

export interface ManagedUser extends User {
  ativo: boolean;
}

export interface Book {
  id: number;
  titulo: string;
  autor: string;
  categoria: string;
  isbn: string;
  ano: number;
  quantidade_total: number;
  quantidade_disponivel: number;
}

export type LoanStatus = 'solicitado' | 'ativo' | 'devolvido' | 'atrasado' | 'recusado';

export interface Loan {
  id: number;
  usuario_id: number;
  usuario_nome: string;
  livro_id: number;
  livro_titulo: string;
  data_emprestimo: string;
  data_prevista_devolucao: string;
  data_devolucao: string | null;
  status: LoanStatus;
}

export interface Reservation {
  id: number;
  usuario_id: number;
  usuario_nome: string;
  livro_id: number;
  livro_titulo: string;
  data_reserva: string;
  status: 'pendente' | 'cancelada';
}

export interface Author {
  id: number;
  nome: string;
}

export interface Category {
  id: number;
  nome: string;
  descricao: string | null;
}

export interface PaginatedResponse<T> {
  dados: T[];
  pagina: number;
  por_pagina: number;
  total: number;
  categorias?: string[];
}

export interface AuthorFilters {
  busca?: string;
  pagina: number;
  por_pagina: number;
  ordenar_por: 'nome';
  ordem: 'asc' | 'desc';
}

export interface CategoryFilters {
  busca?: string;
  pagina: number;
  por_pagina: number;
  ordenar_por: 'nome';
  ordem: 'asc' | 'desc';
}

export interface UserFilters {
  busca?: string;
  perfil?: UserRole;
  status?: 'ativo' | 'inativo';
  pagina: number;
  por_pagina: number;
  ordenar_por: 'nome' | 'email' | 'perfil';
  ordem: 'asc' | 'desc';
}

export interface BookFilters {
  busca?: string;
  categoria?: string;
  disponibilidade?: 'disponivel' | 'indisponivel';
  pagina: number;
  por_pagina: number;
  ordenar_por: string;
  ordem: 'asc' | 'desc';
}

export interface LoanFilters {
  status?: LoanStatus;
  usuario_id?: number;
  data_inicio?: string;
  data_fim?: string;
  pagina: number;
  por_pagina: number;
  ordenar_por: 'data_emprestimo' | 'data_prevista_devolucao';
  ordem: 'asc' | 'desc';
}

export interface ReservationFilters {
  status?: Reservation['status'];
  usuario_id?: number;
  livro_id?: number;
  pagina: number;
  por_pagina: number;
  ordenar_por: 'data_reserva';
  ordem: 'asc' | 'desc';
}

export interface ReportFilters {
  data_inicio: string;
  data_fim: string;
}

export type ReportType =
  | 'livros-mais-emprestados'
  | 'emprestimos-por-periodo'
  | 'emprestimos-atrasados'
  | 'usuarios-mais-ativos';

export interface ReportBookRow {
  livro_id: number;
  titulo: string;
  autor: string;
  total_emprestimos: number;
}

export interface ReportPeriodRow {
  periodo: string;
  total: number;
}

export interface ReportUserRow {
  usuario_id: number;
  nome: string;
  total_emprestimos: number;
}

export interface ReportResponse<T> {
  tipo: ReportType;
  filtros: ReportFilters;
  dados: T;
}

export interface ApiErrorBody {
  mensagem?: string;
  erros?: Record<string, string | string[]>;
}

export interface DashboardSummary {
  total_livros: number;
  livros_emprestados: number;
  emprestimos_atrasados: number;
  reservas_pendentes: number;
  usuarios: number;
}
