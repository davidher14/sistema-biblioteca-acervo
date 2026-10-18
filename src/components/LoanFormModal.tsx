import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { BookOpen, LoaderCircle, X } from 'lucide-react';
import { loanSchema, type LoanFormValues } from '../schemas/loanSchema';
import { livrosService } from '../services/api/livrosService';
import { usuariosService } from '../services/api/usuariosService';
import type { Book, BookFilters, UserFilters } from '../types';
import { getErrorMessage, getFieldErrors } from '../utils/errors';
import type { LoanCreateInput } from '../services/api/emprestimosService';

interface Props {
  initialBook: Book | null;
  pending: boolean;
  reservePending: boolean;
  error: unknown;
  reserveError: unknown;
  onClose: () => void;
  onSubmit: (values: LoanCreateInput) => Promise<void>;
  onReserve: (values: Pick<LoanFormValues, 'usuario_id' | 'livro_id'>) => Promise<void>;
}

function getLocalDate(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

export default function LoanFormModal({ initialBook, pending, reservePending, error, reserveError, onClose, onSubmit, onReserve }: Props) {
  const usersFilters: UserFilters = { status: 'ativo', pagina: 1, por_pagina: 100, ordenar_por: 'nome', ordem: 'asc' };
  const booksFilters: BookFilters = { pagina: 1, por_pagina: 100, ordenar_por: 'titulo', ordem: 'asc' };
  const usersQuery = useQuery({ queryKey: ['loan-form-users', usersFilters], queryFn: () => usuariosService.listar(usersFilters) });
  const booksQuery = useQuery({ queryKey: ['loan-form-books', booksFilters], queryFn: () => livrosService.listar(booksFilters) });
  const fetchedBooks = booksQuery.data?.dados ?? [];
  const bookOptions = initialBook && !fetchedBooks.some((book) => book.id === initialBook.id)
    ? [...fetchedBooks, initialBook]
    : fetchedBooks;
  const { register, handleSubmit, control, getValues, setError, formState: { errors } } = useForm<LoanFormValues>({
    resolver: zodResolver(loanSchema),
    mode: 'onChange',
    defaultValues: { usuario_id: 0, livro_id: initialBook?.id ?? 0, data_emprestimo: getLocalDate(), data_prevista_devolucao: getLocalDate(14) },
  });
  const selectedBookId = useWatch({ control, name: 'livro_id' });
  const selectedBook = bookOptions.find((book) => book.id === Number(selectedBookId));
  const isPending = pending || reservePending;

  useEffect(() => {
    const fieldErrors = getFieldErrors(error);
    for (const field of ['usuario_id', 'livro_id', 'data_emprestimo', 'data_prevista_devolucao'] as const) {
      if (fieldErrors[field]) setError(field, { message: fieldErrors[field] });
    }
  }, [error, setError]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isPending) onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPending, onClose]);

  async function reserveSelectedBook() {
    const values = getValues();
    if (!values.usuario_id || !values.livro_id) {
      if (!values.usuario_id) setError('usuario_id', { message: 'Selecione um usuário para a reserva.' });
      if (!values.livro_id) setError('livro_id', { message: 'Selecione um livro para a reserva.' });
      return;
    }
    await onReserve({ usuario_id: Number(values.usuario_id), livro_id: Number(values.livro_id) });
  }

  const optionsError = usersQuery.isError || booksQuery.isError;
  const optionsLoading = usersQuery.isLoading || booksQuery.isLoading;

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !isPending) onClose(); }}>
      <section className="book-modal loan-modal" role="dialog" aria-modal="true" aria-labelledby="loan-modal-title">
        <div className="book-modal__header">
          <div className="book-modal__icon"><BookOpen size={20} /></div>
          <div>
            <div className="eyebrow">MOVIMENTAÇÃO DO ACERVO</div>
            <h2 id="loan-modal-title">Registrar empréstimo</h2>
          </div>
          <button className="icon-button" onClick={onClose} disabled={isPending} aria-label="Fechar formulário"><X size={19} /></button>
        </div>
        <form onSubmit={handleSubmit((values) => onSubmit({
          ...values,
          usuario_id: Number(values.usuario_id),
          livro_id: Number(values.livro_id),
        }))} noValidate>
          {optionsLoading && <div className="loan-options-message"><LoaderCircle size={16} className="spin" /> Carregando usuários e livros...</div>}
          {optionsError && (
            <div className="form-alert" role="alert">
              Não foi possível carregar as opções do empréstimo.
              <button className="text-link" type="button" onClick={() => { void usersQuery.refetch(); void booksQuery.refetch(); }}>Tentar novamente</button>
            </div>
          )}
          {!optionsLoading && !optionsError && (
            <>
              <div className="form-field">
                <label className="field-label" htmlFor="loan-usuario">Usuário</label>
                <select className={`text-input ${errors.usuario_id ? 'text-input--error' : ''}`} id="loan-usuario" autoFocus {...register('usuario_id')}>
                  <option value={0}>Selecione um usuário</option>
                  {usersQuery.data?.dados.map((user) => <option key={user.id} value={user.id}>{user.nome} · {user.email}</option>)}
                </select>
                {errors.usuario_id && <span className="field-error">{errors.usuario_id.message}</span>}
                {usersQuery.data?.total === 0 && <span className="field-hint">Não há usuários ativos cadastrados.</span>}
              </div>
              <div className="form-field">
                <label className="field-label" htmlFor="loan-livro">Livro</label>
                <select className={`text-input ${errors.livro_id ? 'text-input--error' : ''}`} id="loan-livro" {...register('livro_id')}>
                  <option value={0}>Selecione um livro</option>
                  {bookOptions.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.titulo} · {book.quantidade_disponivel > 0 ? `${book.quantidade_disponivel} disponível(is)` : 'indisponível'}
                    </option>
                  ))}
                </select>
                {errors.livro_id && <span className="field-error">{errors.livro_id.message}</span>}
                {booksQuery.data?.total === 0 && <span className="field-hint">Cadastre livros antes de registrar empréstimos.</span>}
              </div>
              {selectedBook?.quantidade_disponivel === 0 && (
                <div className="loan-reservation-callout">
                  <div><strong>Sem exemplares disponíveis</strong><span>Este título pode ser reservado para o usuário selecionado.</span></div>
                  <button className="button button--secondary" type="button" onClick={() => { void reserveSelectedBook(); }} disabled={isPending || !usersQuery.data?.total}>
                    {reservePending ? <><LoaderCircle size={15} className="spin" /> Reservando...</> : 'Reservar livro'}
                  </button>
                </div>
              )}
              {selectedBook && selectedBook.quantidade_disponivel > 0 && (
                <div className="loan-form-grid">
                  <div className="form-field">
                    <label className="field-label" htmlFor="loan-data-emprestimo">Data do empréstimo</label>
                    <input className={`text-input ${errors.data_emprestimo ? 'text-input--error' : ''}`} id="loan-data-emprestimo" type="date" {...register('data_emprestimo')} />
                    {errors.data_emprestimo && <span className="field-error">{errors.data_emprestimo.message}</span>}
                  </div>
                  <div className="form-field">
                    <label className="field-label" htmlFor="loan-data-prevista">Devolução prevista</label>
                    <input className={`text-input ${errors.data_prevista_devolucao ? 'text-input--error' : ''}`} id="loan-data-prevista" type="date" {...register('data_prevista_devolucao')} />
                    {errors.data_prevista_devolucao && <span className="field-error">{errors.data_prevista_devolucao.message}</span>}
                  </div>
                </div>
              )}
            </>
          )}
          {Boolean(error) && Object.keys(getFieldErrors(error)).length === 0 && (
            <div className="form-alert" role="alert">{getErrorMessage(error, 'Não foi possível registrar o empréstimo.')}</div>
          )}
          {Boolean(reserveError) && (
            <div className="form-alert" role="alert">{getErrorMessage(reserveError, 'Não foi possível reservar o livro.')}</div>
          )}
          <div className="book-modal__footer">
            <button className="button button--secondary" type="button" onClick={onClose} disabled={isPending}>Cancelar</button>
            {selectedBook?.quantidade_disponivel !== 0 && (
              <button className="button button--primary" type="submit" disabled={isPending || optionsLoading || optionsError || !usersQuery.data?.total || !booksQuery.data?.dados.some((book) => book.quantidade_disponivel > 0)}>
                {pending ? <><LoaderCircle size={17} className="spin" /> Registrando...</> : 'Confirmar empréstimo'}
              </button>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
