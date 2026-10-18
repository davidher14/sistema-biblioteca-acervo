import { useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, CirclePlus, LoaderCircle, Pencil, Search, Trash2, UserRound, UsersRound, X } from 'lucide-react';
import AuthorFormModal from '../components/AuthorFormModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { autoresService } from '../services/api/autoresService';
import type { Author, AuthorFilters } from '../types';
import { getErrorMessage } from '../utils/errors';

const PAGE_SIZE = 8;

export default function AuthorsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const isAdmin = user?.perfil === 'admin';
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [editing, setEditing] = useState<Author | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filters: AuthorFilters = useMemo(() => ({
    busca: search || undefined,
    pagina: page,
    por_pagina: PAGE_SIZE,
    ordenar_por: 'nome',
    ordem: sortOrder,
  }), [search, page, sortOrder]);

  const authorsQuery = useQuery({
    queryKey: ['authors', filters],
    queryFn: () => autoresService.listar(filters),
  });

  const saveMutation = useMutation({
    mutationFn: ({ id, nome }: { id?: number; nome: string }) => id
      ? autoresService.atualizar(id, nome)
      : autoresService.criar(nome),
    onSuccess: async (_author, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['authors'] });
      setModalOpen(false);
      setEditing(null);
      setPage(1);
      if (!variables.id) {
        setSearch('');
        setSearchInput('');
      }
      toast.success(variables.id ? 'Autor atualizado com sucesso.' : 'Autor cadastrado com sucesso.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: autoresService.excluir,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['authors'] });
      if (authors.length === 1 && page > 1) setPage((current) => current - 1);
      toast.success('Autor removido com sucesso.');
    },
  });

  const authors = authorsQuery.data?.dados ?? [];
  const total = authorsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const firstResult = total ? (page - 1) * PAGE_SIZE + 1 : 0;
  const lastResult = Math.min(page * PAGE_SIZE, total);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  }

  function clearSearch() {
    setSearch('');
    setSearchInput('');
    setPage(1);
  }

  function openCreate() {
    saveMutation.reset();
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(author: Author) {
    saveMutation.reset();
    setEditing(author);
    setModalOpen(true);
  }

  async function removeAuthor(author: Author) {
    try {
      await deleteMutation.mutateAsync(author.id);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Não foi possível excluir o autor.'));
    }
  }

  async function saveAuthor(nome: string) {
    try {
      await saveMutation.mutateAsync({ id: editing?.id, nome });
    } catch {
      // Os erros da API são apresentados no próprio formulário.
    }
  }

  return (
    <div className="authors-page">
      <div className="page-title-row">
        <div>
          <div className="eyebrow">PESSOAS QUE DÃO VIDA ÀS HISTÓRIAS</div>
          <h1>Autores<span>.</span></h1>
          <p className="page-subtitle">Organize os nomes por trás dos livros do seu acervo.</p>
        </div>
        {isAdmin && <button className="button button--primary" onClick={openCreate}><CirclePlus size={18} /> Adicionar autor</button>}
      </div>

      <section className="catalog-card" aria-label="Catálogo de autores">
        <div className="catalog-toolbar authors-toolbar">
          <form className="catalog-search" onSubmit={submitSearch} role="search">
            <Search size={18} />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Buscar por nome do autor..."
              aria-label="Buscar autores"
            />
            {searchInput && <button type="button" className="icon-button search-clear" onClick={clearSearch} aria-label="Limpar busca"><X size={16} /></button>}
            <button className="search-submit" type="submit">Buscar</button>
          </form>
          <div className="authors-total"><UsersRound size={16} /><span><strong>{total}</strong> {total === 1 ? 'autor cadastrado' : 'autores cadastrados'}</span></div>
        </div>

        <div className="table-wrap">
          <table className="authors-table">
            <thead>
              <tr>
                <th>
                  <button className="table-sort" onClick={() => setSortOrder((order) => order === 'asc' ? 'desc' : 'asc')}>
                    AUTOR(A) {sortOrder === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
                  </button>
                </th>
                {isAdmin && <th><span className="sr-only">Ações</span></th>}
              </tr>
            </thead>
            <tbody>
              {authorsQuery.isLoading && Array.from({ length: 5 }, (_, index) => (
                <tr className="skeleton-row" key={`skeleton-${index}`}><td><span /></td>{isAdmin && <td />}</tr>
              ))}
              {!authorsQuery.isLoading && authorsQuery.isError && (
                <tr><td colSpan={isAdmin ? 2 : 1}>
                  <div className="table-state table-state--error">
                    <strong>Não foi possível carregar os autores.</strong>
                    <button className="text-link" onClick={() => authorsQuery.refetch()}>Tentar novamente</button>
                  </div>
                </td></tr>
              )}
              {!authorsQuery.isLoading && !authorsQuery.isError && authors.length === 0 && (
                <tr><td colSpan={isAdmin ? 2 : 1}>
                  <div className="table-state">
                    <div className="empty-icon"><UserRound size={23} /></div>
                    <strong>Nenhum autor encontrado</strong>
                    <span>{search ? 'Tente ajustar a busca ou limpar o filtro.' : 'Cadastre autores para organizar os nomes do seu acervo.'}</span>
                    {search && <button className="text-link" onClick={clearSearch}>Limpar busca</button>}
                  </div>
                </td></tr>
              )}
              {!authorsQuery.isLoading && !authorsQuery.isError && authors.map((author) => {
                const initials = author.nome.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toLocaleUpperCase('pt-BR');
                return (
                  <tr key={author.id}>
                    <td>
                      <div className="author-info">
                        <div className="author-avatar" aria-hidden="true">{initials}</div>
                        <strong className="author-name">{author.nome}</strong>
                      </div>
                    </td>
                    {isAdmin && <td>
                      <div className="row-actions">
                        <button className="icon-button row-action" onClick={() => openEdit(author)} aria-label={`Editar ${author.nome}`} title="Editar"><Pencil size={16} /></button>
                        <ConfirmDialog
                          trigger={<button className="icon-button row-action row-action--delete" disabled={deleteMutation.isPending} aria-label={`Excluir ${author.nome}`} title="Excluir"><Trash2 size={16} /></button>}
                          title="Excluir cadastro de autor?"
                          description={`“${author.nome}” será removido do cadastro de autores. Esta ação não pode ser desfeita.`}
                          confirmLabel="Excluir autor"
                          destructive
                          pending={deleteMutation.isPending}
                          onConfirm={() => removeAuthor(author)}
                        />
                      </div>
                    </td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="catalog-footer">
          <span>Mostrando <strong>{firstResult}–{lastResult}</strong> de <strong>{authorsQuery.data?.total ?? '—'}</strong> autores</span>
          <div className="pagination">
            <button className="icon-button pagination__button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1} aria-label="Página anterior"><ChevronLeft size={17} /></button>
            <span>Página <strong>{page}</strong> de <strong>{totalPages}</strong></span>
            <button className="icon-button pagination__button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page >= totalPages} aria-label="Próxima página"><ChevronRight size={17} /></button>
          </div>
        </div>
      </section>
      {!isAdmin && <p className="reader-hint"><UserRound size={15} /> Você está no modo leitor. Consulte os autores cadastrados na biblioteca.</p>}
      {modalOpen && (
        <AuthorFormModal
          author={editing}
          pending={saveMutation.isPending}
          error={saveMutation.error}
          onClose={() => { if (!saveMutation.isPending) setModalOpen(false); }}
          onSubmit={saveAuthor}
        />
      )}
      {deleteMutation.isPending && <div className="saving-indicator"><LoaderCircle size={16} className="spin" /> Atualizando autores...</div>}
    </div>
  );
}
