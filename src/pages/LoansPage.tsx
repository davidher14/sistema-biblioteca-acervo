import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, ArrowUpDown, BookOpen, CalendarDays, Check, ChevronLeft, ChevronRight, CirclePlus, Clock3, UserRound, X } from 'lucide-react';
import LoanFormModal from '../components/LoanFormModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { emprestimosService, type LoanCreateInput } from '../services/api/emprestimosService';
import { reservasService } from '../services/api/reservasService';
import type { Book, Loan, LoanFilters, LoanStatus } from '../types';
import { getErrorMessage } from '../utils/errors';

const PAGE_SIZE = 10;

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
}

function isBook(value: unknown): value is Book {
  if (typeof value !== 'object' || value === null) return false;
  return 'id' in value && typeof value.id === 'number'
    && 'titulo' in value && typeof value.titulo === 'string'
    && 'autor' in value && typeof value.autor === 'string'
    && 'categoria' in value && typeof value.categoria === 'string'
    && 'isbn' in value && typeof value.isbn === 'string'
    && 'ano' in value && typeof value.ano === 'number'
    && 'quantidade_total' in value && typeof value.quantidade_total === 'number'
    && 'quantidade_disponivel' in value && typeof value.quantidade_disponivel === 'number';
}

const statusLabels: Record<LoanStatus, string> = {
  solicitado: 'Aguardando aprovação',
  ativo: 'Ativo',
  devolvido: 'Devolvido',
  atrasado: 'Atrasado',
  recusado: 'Recusado',
};

export default function LoansPage() {
  const { user } = useAuth();
  const isAdmin = user?.perfil === 'admin';
  const toast = useToast();
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedBook = (location.state as { livro?: unknown } | null)?.livro;
  const initialBook = isBook(requestedBook) ? requestedBook : null;
  const [status, setStatus] = useState<LoanStatus | ''>(() => {
    const initialStatus = searchParams.get('status');
    return isLoanStatus(initialStatus) ? initialStatus : '';
  });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<LoanFilters['ordenar_por']>('data_emprestimo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [modalOpen, setModalOpen] = useState(() => initialBook !== null);

  useEffect(() => {
    const nextStatus = searchParams.get('status');
    setStatus(isLoanStatus(nextStatus) ? nextStatus : '');
    setPage(1);
  }, [searchParams]);

  const filters: LoanFilters = useMemo(() => ({
    usuario_id: isAdmin ? undefined : user?.id,
    status: status || undefined,
    data_inicio: startDate || undefined,
    data_fim: endDate || undefined,
    pagina: page,
    por_pagina: PAGE_SIZE,
    ordenar_por: sortBy,
    ordem: sortOrder,
  }), [isAdmin, user?.id, status, startDate, endDate, page, sortBy, sortOrder]);

  const loansQuery = useQuery({
    queryKey: ['loans', filters],
    queryFn: () => emprestimosService.listar(filters),
  });

  const createMutation = useMutation({
    mutationFn: emprestimosService.criar,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['loans'] }),
        queryClient.invalidateQueries({ queryKey: ['books'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]);
      setPage(1);
      closeLoanModal();
      toast.success('Empréstimo registrado com sucesso.');
    },
  });

  const reserveMutation = useMutation({
    mutationFn: reservasService.criar,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      await queryClient.invalidateQueries({ queryKey: ['reservations'] });
      closeLoanModal();
      toast.success('Reserva registrada com sucesso.');
    },
  });

  const approveMutation = useMutation({
    mutationFn: emprestimosService.aprovar,
    onSuccess: async (loan) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['loans'] }),
        queryClient.invalidateQueries({ queryKey: ['books'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]);
      toast.success(`Solicitação de “${loan.livro_titulo}” aprovada.`);
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Não foi possível aprovar a solicitação. Verifique a disponibilidade do livro.')),
  });

  const rejectMutation = useMutation({
    mutationFn: emprestimosService.recusar,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast.success('Solicitação recusada.');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Não foi possível recusar a solicitação.')),
  });

  const loans = loansQuery.data?.dados ?? [];
  const total = loansQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const firstResult = total ? (page - 1) * PAGE_SIZE + 1 : 0;
  const lastResult = Math.min(page * PAGE_SIZE, total);

  function updateSort(field: LoanFilters['ordenar_por']) {
    if (sortBy === field) setSortOrder((current) => current === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('desc'); }
    setPage(1);
  }

  function sortIcon(field: LoanFilters['ordenar_por']) {
    if (sortBy !== field) return <ArrowUpDown size={13} />;
    return sortOrder === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />;
  }

  async function registerLoan(input: LoanCreateInput) {
    try {
      await createMutation.mutateAsync(input);
    } catch {
      // O erro da API é apresentado no formulário.
    }
  }

  async function reserveBook(input: Pick<Loan, 'usuario_id' | 'livro_id'>) {
    try {
      await reserveMutation.mutateAsync(input);
    } catch {
      // O erro da API é apresentado no formulário.
    }
  }

  function resetFilters() {
    changeStatus('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  }

  function changeStatus(value: string) {
    const nextStatus = isLoanStatus(value) ? value : '';
    setStatus(nextStatus);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (nextStatus) next.set('status', nextStatus);
      else next.delete('status');
      return next;
    }, { replace: true });
    setPage(1);
  }

  function isLoanStatus(value: string | null): value is LoanStatus {
    return value === 'solicitado' || value === 'ativo' || value === 'devolvido' || value === 'atrasado' || value === 'recusado';
  }

  function closeLoanModal() {
    setModalOpen(false);
    if (initialBook) {
      navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
    }
  }

  return (
    <div className="loans-page">
      <div className="page-title-row">
        <div>
          <div className="eyebrow">CIRCULAÇÃO DO ACERVO</div>
          <h1>{isAdmin ? 'Empréstimos' : 'Meus empréstimos'}<span>.</span></h1>
          <p className="page-subtitle">{isAdmin ? 'Acompanhe empréstimos e aprove as solicitações dos leitores.' : 'Acompanhe suas solicitações, prazos e situação dos livros.'}</p>
        </div>
        {isAdmin && <button className="button button--primary" onClick={() => { createMutation.reset(); reserveMutation.reset(); setModalOpen(true); }}>
          <CirclePlus size={18} /> Registrar empréstimo
        </button>}
      </div>

      <section className="catalog-card" aria-label="Lista de empréstimos">
        <div className="catalog-toolbar loans-toolbar">
          <div className="loans-filters">
            <label className="filter-select">
              <span className="sr-only">Filtrar por status</span>
              <select value={status} onChange={(event) => changeStatus(event.target.value)}>
                <option value="">Todos os status</option>
                <option value="ativo">Ativos</option>
                <option value="devolvido">Devolvidos</option>
                <option value="atrasado">Atrasados</option>
                <option value="solicitado">Aguardando aprovação</option>
                <option value="recusado">Recusados</option>
              </select>
            </label>
            <label className="loan-date-filter">
              <CalendarDays size={15} />
              <span className="sr-only">Empréstimos a partir de</span>
              <input type="date" value={startDate} onChange={(event) => { setStartDate(event.target.value); setPage(1); }} aria-label="Empréstimos a partir de" />
            </label>
            <label className="loan-date-filter">
              <span className="sr-only">Empréstimos até</span>
              <input type="date" value={endDate} onChange={(event) => { setEndDate(event.target.value); setPage(1); }} aria-label="Empréstimos até" />
            </label>
            {(status || startDate || endDate) && <button className="text-link loans-clear" onClick={resetFilters}>Limpar filtros</button>}
          </div>
          <div className="loans-total"><BookOpen size={16} /><span><strong>{total}</strong> {total === 1 ? 'empréstimo' : 'empréstimos'}</span></div>
        </div>

        <div className="table-wrap">
          <table className="loans-table">
            <thead><tr>
              {isAdmin && <th>USUÁRIO</th>}
              <th>LIVRO</th>
              <th><button className="table-sort" onClick={() => updateSort('data_emprestimo')}>EMPRÉSTIMO {sortIcon('data_emprestimo')}</button></th>
              <th><button className="table-sort" onClick={() => updateSort('data_prevista_devolucao')}>DEVOLUÇÃO PREVISTA {sortIcon('data_prevista_devolucao')}</button></th>
              <th>STATUS</th>
              {isAdmin && <th>AÇÃO</th>}
            </tr></thead>
            <tbody>
              {loansQuery.isLoading && Array.from({ length: 5 }, (_, index) => (
                <tr className="skeleton-row" key={`skeleton-${index}`}>{isAdmin && <td><span /><small /></td>}<td><span /><small /></td><td><span /></td><td><span /></td><td><span /></td>{isAdmin && <td />}</tr>
              ))}
              {!loansQuery.isLoading && loansQuery.isError && <tr><td colSpan={isAdmin ? 6 : 4}><div className="table-state table-state--error"><strong>Não foi possível carregar os empréstimos.</strong><button className="text-link" onClick={() => loansQuery.refetch()}>Tentar novamente</button></div></td></tr>}
              {!loansQuery.isLoading && !loansQuery.isError && loans.length === 0 && <tr><td colSpan={isAdmin ? 6 : 4}>
                <div className="table-state"><div className="empty-icon"><BookOpen size={23} /></div><strong>{isAdmin ? 'Nenhum empréstimo encontrado' : 'Você ainda não tem solicitações'}</strong><span>{status || startDate || endDate ? 'Ajuste os filtros para consultar outros empréstimos.' : isAdmin ? 'As solicitações dos leitores e os empréstimos registrados aparecerão aqui.' : 'Consulte o acervo para solicitar um livro disponível.'}</span>{(status || startDate || endDate) && <button className="text-link" onClick={resetFilters}>Limpar filtros</button>}</div>
              </td></tr>}
              {!loansQuery.isLoading && !loansQuery.isError && loans.map((loan) => (
                <tr className={loan.status === 'atrasado' ? 'loan-row--overdue' : ''} key={loan.id}>
                  {isAdmin && <td><div className="loan-person"><span className="loan-cell-icon"><UserRound size={15} /></span><strong>{loan.usuario_nome}</strong></div></td>}
                  <td><div className="loan-book"><strong>{loan.livro_titulo}</strong><small>Empréstimo #{loan.id}</small></div></td>
                  <td>{formatDate(loan.data_emprestimo)}</td>
                  <td><span className={loan.status === 'atrasado' ? 'loan-due loan-due--overdue' : 'loan-due'}>{loan.status === 'solicitado' ? 'Após aprovação' : loan.status === 'recusado' ? '—' : formatDate(loan.data_prevista_devolucao)}</span></td>
                  <td><span className={`loan-status loan-status--${loan.status}`}><span />{statusLabels[loan.status]}</span></td>
                  {isAdmin && <td>
                    {loan.status === 'solicitado' ? (
                      <div className="flex min-w-max items-center justify-end gap-2">
                        <button className="button button--primary loan-return-button" onClick={() => approveMutation.mutate(loan.id)} disabled={approveMutation.isPending || rejectMutation.isPending}>
                          <Check size={14} /> Aprovar
                        </button>
                        <ConfirmDialog
                          trigger={<button className="button button--secondary reservation-cancel-button" disabled={approveMutation.isPending || rejectMutation.isPending}>
                            <X size={14} /> Recusar
                          </button>}
                          title="Recusar solicitação?"
                          description={`A solicitação de “${loan.livro_titulo}” feita por ${loan.usuario_nome} será recusada. O leitor poderá consultar novamente o acervo.`}
                          confirmLabel="Recusar solicitação"
                          destructive
                          pending={rejectMutation.isPending}
                          onConfirm={async () => { await rejectMutation.mutateAsync(loan.id); }}
                        />
                      </div>
                    ) : <span className="return-completed">—</span>}
                  </td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="catalog-footer">
          <span>Mostrando <strong>{firstResult}–{lastResult}</strong> de <strong>{loansQuery.data ? total : '—'}</strong> empréstimos</span>
          <div className="pagination">
            <button className="icon-button pagination__button" aria-label="Página anterior" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}><ChevronLeft size={16} /></button>
            <span>Página <strong>{page}</strong> de <strong>{totalPages}</strong></span>
            <button className="icon-button pagination__button" aria-label="Próxima página" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}><ChevronRight size={16} /></button>
          </div>
        </div>
      </section>
      <p className="loans-footnote"><Clock3 size={14} /> Os atrasos são sinalizados quando a data prevista de devolução passa sem registro de devolução.</p>
      {modalOpen && (
        <LoanFormModal
          initialBook={initialBook}
          pending={createMutation.isPending}
          reservePending={reserveMutation.isPending}
          error={createMutation.error}
          reserveError={reserveMutation.error}
          onClose={closeLoanModal}
          onSubmit={registerLoan}
          onReserve={reserveBook}
        />
      )}
    </div>
  );
}
