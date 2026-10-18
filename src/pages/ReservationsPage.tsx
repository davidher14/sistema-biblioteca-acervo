import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, Bookmark, CalendarDays, ChevronLeft, ChevronRight, RotateCcw, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../contexts/ToastContext';
import { reservasService } from '../services/api/reservasService';
import type { Reservation, ReservationFilters } from '../types';
import { getErrorMessage } from '../utils/errors';

const PAGE_SIZE = 10;

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
}

export default function ReservationsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState<Reservation['status'] | ''>(() => {
    const initialStatus = searchParams.get('status');
    return initialStatus === 'pendente' || initialStatus === 'cancelada' ? initialStatus : 'pendente';
  });
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const filters: ReservationFilters = useMemo(() => ({
    status: status || undefined,
    pagina: page,
    por_pagina: PAGE_SIZE,
    ordenar_por: 'data_reserva',
    ordem: sortOrder,
  }), [status, page, sortOrder]);

  const reservationsQuery = useQuery({
    queryKey: ['reservations', filters],
    queryFn: () => reservasService.listar(filters),
  });
  const reservations = reservationsQuery.data?.dados ?? [];

  const cancelMutation = useMutation({
    mutationFn: reservasService.cancelar,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['reservations'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]);
      if (status === 'pendente' && reservations.length === 1 && page > 1) setPage((current) => current - 1);
      toast.success('Reserva cancelada com sucesso.');
    },
  });

  const total = reservationsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const firstResult = total ? (page - 1) * PAGE_SIZE + 1 : 0;
  const lastResult = Math.min(page * PAGE_SIZE, total);

  function changeStatus(value: string) {
    const nextStatus = value === 'pendente' || value === 'cancelada' ? value : '';
    setStatus(nextStatus);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (nextStatus) next.set('status', nextStatus);
      else next.delete('status');
      return next;
    }, { replace: true });
    setPage(1);
  }

  async function cancelReservation(reservation: Reservation) {
    try {
      await cancelMutation.mutateAsync(reservation.id);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Não foi possível cancelar a reserva.'));
    }
  }

  return (
    <div className="reservations-page">
      <div className="page-title-row">
        <div>
          <div className="eyebrow">FILA DE INTERESSE</div>
          <h1>Reservas<span>.</span></h1>
          <p className="page-subtitle">Acompanhe os livros reservados e gerencie sua disponibilidade.</p>
        </div>
        <Link to="/emprestimos" className="button button--secondary"><Bookmark size={16} /> Reservar um livro</Link>
      </div>

      <section className="catalog-card" aria-label="Lista de reservas">
        <div className="catalog-toolbar loans-toolbar">
          <div className="loans-filters">
            <label className="filter-select">
              <span className="sr-only">Filtrar por status</span>
              <select value={status} onChange={(event) => changeStatus(event.target.value)}>
                <option value="">Todos os status</option>
                <option value="pendente">Pendentes</option>
                <option value="cancelada">Canceladas</option>
              </select>
            </label>
            <button className="table-sort reservation-sort" onClick={() => { setSortOrder((current) => current === 'asc' ? 'desc' : 'asc'); setPage(1); }}>
              <CalendarDays size={15} /> Data da reserva {sortOrder === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
            </button>
          </div>
          <div className="loans-total"><Bookmark size={16} /><span><strong>{total}</strong> {total === 1 ? 'reserva' : 'reservas'}</span></div>
        </div>

        <div className="table-wrap">
          <table className="loans-table reservations-table">
            <thead><tr>
              <th>USUÁRIO</th>
              <th>LIVRO</th>
              <th>DATA DA RESERVA</th>
              <th>STATUS</th>
              <th>AÇÃO</th>
            </tr></thead>
            <tbody>
              {reservationsQuery.isLoading && Array.from({ length: 5 }, (_, index) => (
                <tr className="skeleton-row" key={`skeleton-${index}`}><td><span /><small /></td><td><span /><small /></td><td><span /></td><td><span /></td><td /></tr>
              ))}
              {!reservationsQuery.isLoading && reservationsQuery.isError && <tr><td colSpan={5}><div className="table-state table-state--error"><strong>Não foi possível carregar as reservas.</strong><button className="text-link" onClick={() => reservationsQuery.refetch()}>Tentar novamente</button></div></td></tr>}
              {!reservationsQuery.isLoading && !reservationsQuery.isError && reservations.length === 0 && <tr><td colSpan={5}>
                <div className="table-state"><div className="empty-icon"><Bookmark size={23} /></div><strong>Nenhuma reserva encontrada</strong><span>{status ? 'Altere o filtro para consultar outros status.' : 'Quando um livro indisponível for reservado, ele aparecerá aqui.'}</span>{status && <button className="text-link" onClick={() => changeStatus('')}>Ver todas as reservas</button>}</div>
              </td></tr>}
              {!reservationsQuery.isLoading && !reservationsQuery.isError && reservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td><div className="loan-person"><span className="loan-cell-icon"><UserRound size={15} /></span><strong>{reservation.usuario_nome}</strong></div></td>
                  <td><div className="loan-book"><strong>{reservation.livro_titulo}</strong><small>Reserva #{reservation.id}</small></div></td>
                  <td>{formatDate(reservation.data_reserva)}</td>
                  <td><span className={`reservation-status reservation-status--${reservation.status}`}><span />{reservation.status === 'pendente' ? 'Pendente' : 'Cancelada'}</span></td>
                  <td>
                    {reservation.status === 'pendente'
                      ? <ConfirmDialog
                        trigger={<button className="button button--secondary reservation-cancel-button" disabled={cancelMutation.isPending} aria-label={`Cancelar reserva de ${reservation.livro_titulo}`}>
                        {cancelMutation.isPending ? <span className="spin"><RotateCcw size={14} /></span> : <RotateCcw size={14} />} Cancelar
                        </button>}
                        title="Cancelar reserva?"
                        description={`A reserva de “${reservation.livro_titulo}” para ${reservation.usuario_nome} será cancelada.`}
                        confirmLabel="Cancelar reserva"
                        destructive
                        pending={cancelMutation.isPending}
                        onConfirm={() => cancelReservation(reservation)}
                      />
                      : <span className="return-completed">Histórico preservado</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="catalog-footer">
          <span>Mostrando <strong>{firstResult}–{lastResult}</strong> de <strong>{reservationsQuery.data ? total : '—'}</strong> reservas</span>
          <div className="pagination">
            <button className="icon-button pagination__button" aria-label="Página anterior" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}><ChevronLeft size={16} /></button>
            <span>Página <strong>{page}</strong> de <strong>{totalPages}</strong></span>
            <button className="icon-button pagination__button" aria-label="Próxima página" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}><ChevronRight size={16} /></button>
          </div>
        </div>
      </section>
    </div>
  );
}
