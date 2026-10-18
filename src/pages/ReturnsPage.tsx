import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ArrowDown, ArrowUp, ArrowUpDown, CalendarDays, ChevronLeft, ChevronRight, RotateCcw, UserRound } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { emprestimosService } from '../services/api/emprestimosService';
import type { Loan, LoanFilters, LoanStatus } from '../types';
import { getErrorMessage } from '../utils/errors';

const PAGE_SIZE = 10;

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
}

const statusLabels: Record<LoanStatus, string> = {
  solicitado: 'Aguardando aprovação',
  ativo: 'Ativo',
  devolvido: 'Devolvido',
  atrasado: 'Atrasado',
  recusado: 'Recusado',
};

export default function ReturnsPage() {
  const { user } = useAuth();
  const isAdmin = user?.perfil === 'admin';
  const toast = useToast();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<LoanStatus | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const filters: LoanFilters = useMemo(() => ({
    usuario_id: isAdmin ? undefined : user?.id,
    status: status || undefined,
    data_inicio: startDate || undefined,
    data_fim: endDate || undefined,
    pagina: page,
    por_pagina: PAGE_SIZE,
    ordenar_por: 'data_prevista_devolucao',
    ordem: sortOrder,
  }), [isAdmin, user?.id, status, startDate, endDate, page, sortOrder]);

  const loansQuery = useQuery({
    queryKey: ['loans', filters],
    queryFn: () => emprestimosService.listar(filters),
  });

  const returnMutation = useMutation({
    mutationFn: emprestimosService.devolver,
    onSuccess: async (loan) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['loans'] }),
        queryClient.invalidateQueries({ queryKey: ['books'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]);
      toast.success(`Devolução de “${loan.livro_titulo}” registrada com sucesso.`);
    },
  });

  const loans = loansQuery.data?.dados ?? [];
  const total = loansQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const firstResult = total ? (page - 1) * PAGE_SIZE + 1 : 0;
  const lastResult = Math.min(page * PAGE_SIZE, total);

  function updateSort() {
    setSortOrder((current) => current === 'asc' ? 'desc' : 'asc');
    setPage(1);
  }

  function resetFilters() {
    setStatus('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  }

  async function registerReturn(loan: Loan) {
    try {
      await returnMutation.mutateAsync(loan.id);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Não foi possível registrar a devolução.'));
    }
  }

  return (
    <div className="loans-page">
      <div className="page-title-row">
        <div>
          <div className="eyebrow">RETORNO AO ACERVO</div>
          <h1>{isAdmin ? 'Devoluções' : 'Minhas devoluções'}<span>.</span></h1>
          <p className="page-subtitle">{isAdmin ? 'Registre os livros retornados e atualize sua disponibilidade.' : 'Consulte e registre a devolução dos seus livros emprestados.'}</p>
        </div>
      </div>

      <section className="catalog-card" aria-label="Empréstimos para devolução">
        <div className="catalog-toolbar loans-toolbar">
          <div className="loans-filters">
            <label className="filter-select">
              <span className="sr-only">Filtrar por status</span>
              <select value={status} onChange={(event) => { setStatus(event.target.value as LoanStatus | ''); setPage(1); }}>
                <option value="">Todos os status</option>
                <option value="ativo">Ativos</option>
                <option value="atrasado">Atrasados</option>
                <option value="devolvido">Devolvidos</option>
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
          <div className="loans-total"><RotateCcw size={16} /><span><strong>{total}</strong> {total === 1 ? 'registro' : 'registros'}</span></div>
        </div>

        <div className="table-wrap">
          <table className="loans-table returns-table">
            <thead><tr>
              <th>USUÁRIO</th>
              <th>LIVRO</th>
              <th>EMPRÉSTIMO</th>
              <th>
                <button className="table-sort" onClick={updateSort}>
                  DEVOLUÇÃO PREVISTA {sortOrder === 'asc' ? <ArrowUp size={13} /> : sortOrder === 'desc' ? <ArrowDown size={13} /> : <ArrowUpDown size={13} />}
                </button>
              </th>
              <th>STATUS</th>
              <th>AÇÃO</th>
            </tr></thead>
            <tbody>
              {loansQuery.isLoading && Array.from({ length: 5 }, (_, index) => (
                <tr className="skeleton-row" key={`skeleton-${index}`}><td><span /><small /></td><td><span /><small /></td><td><span /></td><td><span /></td><td><span /></td><td /></tr>
              ))}
              {!loansQuery.isLoading && loansQuery.isError && <tr><td colSpan={6}><div className="table-state table-state--error"><strong>Não foi possível carregar os empréstimos.</strong><button className="text-link" onClick={() => loansQuery.refetch()}>Tentar novamente</button></div></td></tr>}
              {!loansQuery.isLoading && !loansQuery.isError && loans.length === 0 && <tr><td colSpan={6}>
                <div className="table-state"><div className="empty-icon"><RotateCcw size={23} /></div><strong>Nenhum empréstimo encontrado</strong><span>{status || startDate || endDate ? 'Ajuste os filtros para consultar outros empréstimos.' : 'Os empréstimos registrados aparecerão aqui para acompanhamento.'}</span>{(status || startDate || endDate) && <button className="text-link" onClick={resetFilters}>Limpar filtros</button>}</div>
              </td></tr>}
              {!loansQuery.isLoading && !loansQuery.isError && loans.map((loan) => (
                <tr className={loan.status === 'atrasado' ? 'loan-row--overdue' : ''} key={loan.id}>
                  <td>{isAdmin
                    ? <div className="loan-person"><span className="loan-cell-icon"><UserRound size={15} /></span><strong>{loan.usuario_nome}</strong></div>
                    : <span className="text-xs text-text-muted">Você</span>}</td>
                  <td><div className="loan-book"><strong>{loan.livro_titulo}</strong><small>Empréstimo #{loan.id}</small></div></td>
                  <td>{formatDate(loan.data_emprestimo)}</td>
                  <td>{formatDate(loan.data_prevista_devolucao)}</td>
                  <td><span className={`loan-status loan-status--${loan.status}`}><span />{statusLabels[loan.status]}</span></td>
                  <td>
                    {loan.status === 'devolvido'
                      ? <span className="return-completed">{loan.data_devolucao ? formatDate(loan.data_devolucao) : 'Concluída'}</span>
                      : loan.status === 'ativo' || loan.status === 'atrasado'
                        ? <ConfirmDialog
                          trigger={<button className="button button--secondary loan-return-button" disabled={returnMutation.isPending} aria-label={`Registrar devolução de ${loan.livro_titulo}`}>
                        {returnMutation.isPending ? <span className="spin"><RotateCcw size={14} /></span> : <RotateCcw size={14} />} Devolver
                          </button>}
                          title="Confirmar devolução"
                          description={`Confirme o retorno de “${loan.livro_titulo}”${isAdmin ? `, emprestado para ${loan.usuario_nome},` : ''}. A disponibilidade será atualizada no acervo.`}
                          confirmLabel="Registrar devolução"
                          icon={RotateCcw}
                          pending={returnMutation.isPending}
                          onConfirm={() => registerReturn(loan)}
                        />
                        : <span className="return-completed">{statusLabels[loan.status]}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="catalog-footer">
          <span>Mostrando <strong>{firstResult}–{lastResult}</strong> de <strong>{loansQuery.data ? total : '—'}</strong> registros</span>
          <div className="pagination">
            <button className="icon-button pagination__button" aria-label="Página anterior" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}><ChevronLeft size={16} /></button>
            <span>Página <strong>{page}</strong> de <strong>{totalPages}</strong></span>
            <button className="icon-button pagination__button" aria-label="Próxima página" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}><ChevronRight size={16} /></button>
          </div>
        </div>
      </section>
      <p className="loans-footnote"><AlertCircle size={14} /> A confirmação da devolução repõe uma unidade disponível no acervo.</p>
    </div>
  );
}
